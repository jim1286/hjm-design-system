import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { checkDocLinks } from "../../../scripts/check-doc-links.mjs";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("documentation link gate", () => {
  it("accepts repository-relative targets and reports a missing target", async () => {
    const directory = await mkdtemp(join(tmpdir(), "hjm-doc-links-"));
    temporaryDirectories.push(directory);
    await mkdir(join(directory, "docs"));
    await writeFile(join(directory, "README.md"), "[guide](docs/guide.md)\n");
    await writeFile(join(directory, "docs/guide.md"), "[missing](missing.md)\n");

    const failed = await checkDocLinks({ rootPath: directory });
    expect(failed).toMatchObject({ ok: false, filesChecked: 2 });
    expect(failed.findings).toContainEqual(expect.objectContaining({
      code: "LINK_TARGET_MISSING",
      path: "docs/guide.md:1",
    }));

    await writeFile(join(directory, "docs/missing.md"), "# Found\n");
    const passed = await checkDocLinks({ rootPath: directory });
    expect(passed).toMatchObject({ ok: true, filesChecked: 3, findings: [] });
  });
});
