export type DocumentationLinkFinding = Readonly<{
  code: string;
  path: string;
  message: string;
}>;

export type DocumentationLinkResult = Readonly<{
  ok: boolean;
  filesChecked: number;
  findings: DocumentationLinkFinding[];
}>;

export function checkDocLinks(options?: Readonly<{
  rootPath?: string;
}>): Promise<DocumentationLinkResult>;
