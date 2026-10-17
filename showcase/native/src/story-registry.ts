import { componentDefinitions } from "@hjmds/design-contracts";

// This is navigation metadata, not proof that a preview executed. S9 checks actual individual CSF entries;
// component-examples and standalone stories own the executable examples.
export const nativeRendererStoryIds = componentDefinitions
  .filter(entry => ["stable", "beta"].includes(entry.surfaces.native.status))
  .map(entry => entry.id);
