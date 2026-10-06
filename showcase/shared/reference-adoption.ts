import type { FilePickerCandidate } from "../../packages/design-contracts/src/file-picker.js";
import type { UploadItemDescriptor, UploadItemState } from "../../packages/design-contracts/src/upload-item.js";
export const uploadLabels = { pending: "전송 대기", uploading: "전송 확인 중", success: "전송 완료", cancel: "취소", retry: "다시 전송" };
export const sampleFile: FilePickerCandidate = { id: "sample", name: "여행 기록.jpg", mimeType: "image/jpeg", sizeBytes: 2048 };
export function mergeSelectedFiles(items: readonly UploadItemDescriptor[], files: readonly FilePickerCandidate[]): UploadItemDescriptor[] {
  const next = [...items];
  for (const file of files) if (!next.some(item => item.id === file.id)) next.push({ id: file.id, name: file.name, state: { status: "pending" } });
  return next;
}
export function changeUploadState(items: readonly UploadItemDescriptor[], id: string, state: UploadItemState): UploadItemDescriptor[] {
  return items.map(item => item.id === id ? { ...item, state } : item);
}
export const scoreLabel = (value: number | null) => value === null ? "아직 평가하지 않았어요" : `${value}점`;
export const beforeImage = { src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NDAiIGhlaWdodD0iMzYwIiB2aWV3Qm94PSIwIDAgNjQwIDM2MCI+PHJlY3Qgd2lkdGg9IjY0MCIgaGVpZ2h0PSIzNjAiIGZpbGw9IiM3ZjhjOGQiLz48Y2lyY2xlIGN4PSI0OTAiIGN5PSI5MCIgcj0iNDQiIGZpbGw9IiNmNWQ4ODQiLz48cGF0aCBkPSJNMCAzNjBWMjUwTDE4MCAxMDUgMzUwIDI3MCA0ODAgMTcwIDY0MCAzMjBWMzYwWiIgZmlsbD0iIzI1Mzg0NyIvPjxwYXRoIGQ9Ik0wIDM2MFYzMjVMMTYwIDI0MCAzNDAgMzQwIDQ4MCAyNTUgNjQwIDM2MFoiIGZpbGw9IiM2Njg2NzUiLz48L3N2Zz4=", width: 640, height: 360, label: "보정 전" };
export const afterImage = { src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NDAiIGhlaWdodD0iMzYwIiB2aWV3Qm94PSIwIDAgNjQwIDM2MCI+PHJlY3Qgd2lkdGg9IjY0MCIgaGVpZ2h0PSIzNjAiIGZpbGw9IiM1MDdmY2IiLz48Y2lyY2xlIGN4PSI0OTAiIGN5PSI5MCIgcj0iNDQiIGZpbGw9IiNmNWQ4ODQiLz48cGF0aCBkPSJNMCAzNjBWMjUwTDE4MCAxMDUgMzUwIDI3MCA0ODAgMTcwIDY0MCAzMjBWMzYwWiIgZmlsbD0iIzI1Mzg0NyIvPjxwYXRoIGQ9Ik0wIDM2MFYzMjVMMTYwIDI0MCAzNDAgMzQwIDQ4MCAyNTUgNjQwIDM2MFoiIGZpbGw9IiM2Njg2NzUiLz48L3N2Zz4=", width: 640, height: 360, label: "보정 후" };
