# Blobatar motion — 2026-10-01

The checks below record the initial implementation checkpoint. The [later Native integration audit](../native-visual-integration-2026-10-01/README.md) adds three-state device captures and selected interaction proofs, and supersedes the earlier unresolved overlay-budget/full-gate status. Native screen-reader and physical-device performance claims are not inferred from those captures.

Web real-browser smoke: enabled idle motion and observed ten running CSS animations,
changed to happy pose and captured `happy.png`, then stopped motion. Native host
adapter test covers explicit activity, offscreen visibility, reduced motion and
background/foreground transitions. Upstream Native drawing is mocked in that test,
so it does not prove Reanimated native compatibility or device geometry.

Both showcases passed typecheck and registration checks. Build, public API map and
document links passed. Optional motion entry budgets pass; static avatar entries
remain separate. Full renderer check retains the known Native overlays gzip failure.

Stopping left no avatar animations. The two animations returned immediately after
the click were HJM button style transitions (their targets were buttons), not
Blobatar loops; target inspection confirmed that distinction.
