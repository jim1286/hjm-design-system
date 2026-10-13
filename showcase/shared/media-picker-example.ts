import type { UploadItemState } from "../../packages/design-contracts/src/upload-item.js";
export const mediaNames = ["강과 산","푸른 계곡","붉은 협곡","강아지","숲속 동물","성","폭포","숲","해안","도시","바다 동물","과일"];
export const mediaLibrary = mediaNames.map((name, index) => ({ id: String(index), index, name: `${name} ${index + 1}` }));
type Entry = Readonly<{ id: string; upload: UploadItemState }>;
type Snapshot = Readonly<{ phase: "selecting" | "review" | "finished"; entries: readonly Entry[]; completed: readonly string[] }>;
// This adapter only simulates a transfer. Products supply real files, permissions and server confirmation.
const demoUpload = async (_id: string, fail: boolean) => {
  await new Promise(resolve => setTimeout(resolve, 350));
  if (fail) throw new Error("demo-upload-failed");
};
export function createMediaPickerExample(failFirst = false, upload = demoUpload) {
  let state: Snapshot = { phase: "selecting", entries: [], completed: [] };
  let failNext = failFirst, generation = 0;
  const attempts = new Map<string, number>(), listeners = new Set<() => void>();
  const publish = (next: Snapshot) => { state = next; for (const listener of listeners) listener(); };
  const invalidate = () => { ++generation; attempts.clear(); };
  const start = (id: string) => {
    const entry = state.entries.find(item => item.id === id);
    if (state.phase !== "review" || !entry || entry.upload.status === "uploading" || entry.upload.status === "success") return;
    const attempt = ++generation, fail = failNext; failNext = false; attempts.set(id, attempt);
    publish({ ...state, entries: state.entries.map(item => item.id === id ? { id, upload: { status: "uploading", progress: null } } : item) });
    const settle = (result: UploadItemState) => {
      // Deletion, returning to the picker and reselection all revoke the old attempt.
      if (attempts.get(id) !== attempt || state.phase !== "review") return;
      attempts.delete(id);
      publish({ ...state, entries: state.entries.map(item => item.id === id ? { id, upload: result } : item) });
    };
    void Promise.resolve().then(() => upload(id, fail)).then(() => settle({ status: "success" }), () => settle({ status: "error", message: "업로드하지 못했어요. 이 사진을 다시 시도해 주세요." }));
  };
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    dispose: invalidate,
    toggle(id: string) {
      if (state.phase !== "selecting" || !mediaLibrary.some(item => item.id === id)) return;
      const exists = state.entries.some(item => item.id === id);
      if (!exists && state.entries.length >= 5) return;
      publish({ ...state, entries: exists ? state.entries.filter(item => item.id !== id) : [...state.entries, { id, upload: { status: "pending" } }] });
    },
    remove(id: string) { if (state.phase !== "review") return; attempts.delete(id); publish({ ...state, entries: state.entries.filter(item => item.id !== id) }); },
    move(id: string, direction: -1 | 1) {
      if (state.phase !== "review") return;
      const entries = [...state.entries], index = entries.findIndex(item => item.id === id), destination = index + direction;
      if (index < 0 || destination < 0 || destination >= entries.length) return;
      const entry = entries.splice(index, 1)[0]!; entries.splice(destination, 0, entry); publish({ ...state, entries });
    },
    retry: start,
    back() { invalidate(); publish({ ...state, phase: "selecting", entries: state.entries.map(item => item.upload.status === "uploading" ? { id: item.id, upload: { status: "pending" } } : item) }); },
    reset() { invalidate(); failNext = failFirst; publish({ phase: "selecting", entries: [], completed: [] }); },
    done() {
      if (!state.entries.length || state.phase === "finished") return;
      if (state.phase === "selecting") {
        publish({ ...state, phase: "review" });
        for (const item of state.entries) start(item.id);
      } else if (state.entries.every(item => item.upload.status === "success")) {
        publish({ ...state, phase: "finished", completed: state.entries.map(item => item.id) });
      }
    },
  };
}
