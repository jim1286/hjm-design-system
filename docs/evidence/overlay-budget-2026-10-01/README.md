# Native overlay budget baseline — 2026-10-01

The import graph contains six modules totaling 79,996 raw / 15,332 gzip bytes under Node 26.9.0. [Baseline](baseline.json) records the source commit and verifies all six emitted files are byte-for-byte identical to that commit. The previous effective gzip limit was 15,320 bytes: the unchanged baseline exceeded it by 12 bytes.

The base allowance changes from 15,100 to 15,120 (+20); the existing provider allowance of 220 remains unchanged. Module count, raw limit, optional-peer restrictions and root-barrel checks remain unchanged. This is a measured baseline correction, not an allowance for new feature imports. The earlier timing-helper experiment reduced raw size but increased gzip size, so it was discarded.

Dialog, AlertDialog, Sheet viewport, modal teardown fallback and composition-style tests passed (35 cases). These are mocked Native regressions, not actual device evidence.
