import { requireOptionalNativeModule } from "expo";
import type { DocumentSaveState } from "@hjmds/design-contracts/document-resource";

export const documentFileHostAvailable = Boolean(
  requireOptionalNativeModule("FileSystem") && requireOptionalNativeModule("ExpoSharing"),
);
let exportSequence = 0;
/** Showcase-owned file access; published renderers never import Expo storage or sharing. */
export async function exportExampleDocument(name: string, body: string, isCurrent: () => boolean = () => true): Promise<DocumentSaveState> {
  if (!documentFileHostAvailable) throw new Error("file host unavailable");
  const { File, Directory, Paths } = require("expo-file-system") as typeof import("expo-file-system");
  const Sharing = require("expo-sharing") as typeof import("expo-sharing");
  if (!await Sharing.isAvailableAsync()) throw new Error("sharing unavailable");
  if (!isCurrent()) throw new Error("detached");
  // Only fixture basenames enter this cache directory; never reinterpret a product path as a name.
  if (!name || name === "." || name === ".." || /[\\/]/.test(name)) throw new Error("invalid fixture name");
  const directory = new Directory(Paths.cache, "hjm-document-resource", `${Date.now()}-${++exportSequence}`);
  directory.create({ intermediates: true });
  const file = new File(directory, name);
  file.write(body);
  if (file.textSync() !== body) throw new Error("fixture readback failed");
  // Each attempt is immutable. Keep its cache file for receiving apps; shareAsync resolving does
  // not prove that a recipient finished reading, saved a copy, or that the user did not cancel.
  await Sharing.shareAsync(file.uri, { mimeType: "text/plain", UTI: "public.plain-text", dialogTitle: "문서 내보내기" });
  return { status: "started" };
}
