import type { createActionSession } from "../../packages/design-contracts/src/action-session.js";
import type { DocumentResourceLabels, DocumentSaveState } from "../../packages/design-contracts/src/document-resource.js";

export const documentResourceLabels: DocumentResourceLabels = {
  preview: "본문 보기", previewLoading: "미리보기를 준비하고 있습니다", previewUnavailable: "미리보기가 없습니다",
  retryPreview: "미리보기 다시 표시", save: "문서 내보내기", saving: "내보내는 중", started: "내보내기를 시작했습니다",
  saved: "저장을 확인했습니다", cancelled: "내보내기를 취소했습니다", retrySave: "내보내기 다시 시도",
};
export const exampleDocumentText = "HJM 문서 예제\n개인 자료가 없는 자체 생성 텍스트입니다.\n";
// This fixture directory is not a package; each Showcase injects its public runtime import.
export function createDocumentResourceExample(createSession: typeof createActionSession, host: (name: string, body: string, isCurrent: () => boolean) => Promise<DocumentSaveState>) {
  const session = createSession<DocumentSaveState>({ status: "idle" });
  let failNext = true;
  let generation = 0;
  return {
    session,
    failNext() { failNext = true; },
    reset() { ++generation; session.reset({ status: "idle" }); },
    save(name: string) {
      const current = generation;
      return session.run(async () => {
        // Deliberate demo latency exposes duplicate clicks and switching files while pending.
        await new Promise(resolve => setTimeout(resolve, 900));
        if (current !== generation) throw new Error("detached");
        if (failNext) { failNext = false; throw new Error("example failure"); }
        return host(name, exampleDocumentText, () => current === generation);
      }, { retryable: true });
    },
    retry() { return session.retry(); },
  };
}
