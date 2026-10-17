import type { UploadItemState } from "../../packages/design-contracts/src/upload-item.js";
export const mediaNames = ["강과 산","푸른 계곡","붉은 협곡","강아지","숲속 동물","성","폭포","숲","해안","도시","바다 동물","과일"];
export const mediaLibrary = mediaNames.map((name, index) => ({ id: String(index), index, name: `${name} ${index + 1}` }));
export const mediaSelectionLimit = 5;
// Visible copy shared by the Web and Native previews. The memory-demo explanation stays in the review/finished
// captions; the selecting notice carries only the product rule (the limit).
export const mediaPickerCopy = {
  title: { selecting: "사진 선택", review: "선택한 사진 업로드", finished: "사진을 선택했어요" },
  states: { loading: "사진을 불러오는 중이에요", empty: "사진이 없어요", restricted: "사진 접근을 허용해 주세요", error: "사진을 불러오지 못했어요" },
  retry: "다시 시도",
  // Leaving is the header exit (close while picking, back from review), not a text action at the header end.
  // The finished step restarts through the done action, so it shows no exit.
  exit: { selecting: "닫기", review: "선택으로 돌아가기" },
  done: { finished: "새로 선택", uploading: "업로드 중", review: (count: number) => `${count}장 추가 완료`, selecting: (count: number) => `${count}장 선택 완료` },
  labels: { pending: "대기", uploading: "업로드 중", success: "업로드 완료", retry: "재시도", cancel: "업로드 취소" },
  actionLabels: { remove: "삭제", moveUp: "앞으로", moveDown: "뒤로" },
  remove: (name: string) => `${name} 삭제`,
  moveUp: (name: string) => `${name} 앞으로`,
  moveDown: (name: string) => `${name} 뒤로`,
  albums: ["최근 항목", "풍경"] as const,
  albumTitle: "앨범",
  close: "닫기",
  limit: `최대 ${mediaSelectionLimit}장`,
  selected: (count: number) => `${count}장 선택 · 선택한 순서대로 추가돼요`,
  selectPrompt: "추가할 사진을 선택하세요",
  deselect: (name: string) => `${name} 선택 해제`,
  finishedNote: "메모리 예제에서 추가를 완료했어요. 실제 서버나 사진 보관함은 바뀌지 않아요.",
  reviewNote: "메모리 업로드 예제예요. 실패한 사진만 다시 시도하거나 삭제하세요.",
  reviewEmpty: "선택한 사진이 없어요. 선택으로 돌아가 사진을 추가하세요.",
  completedCount: (count: number) => `${count}장을 선택했어요.`,
  completedItem: (name: string) => `${name} 선택 완료`,
} as const;
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
      if (!exists && state.entries.length >= mediaSelectionLimit) return;
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
