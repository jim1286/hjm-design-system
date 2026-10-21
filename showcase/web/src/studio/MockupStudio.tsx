import { SceneTimeline, SettingChoice } from "./SceneTimeline.js";
import { sampleSceneTimeline } from "../../../shared/scene-timeline.js";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Grid, Stack, Surface, Text } from "@hjmds/react/layout";
import { ScreenLayout } from "@hjmds/react/screens";
import { FilePicker } from "@hjmds/react/file-picker";
import type { FilePickerSelectionResult } from "@hjmds/design-contracts/components/file-picker";
import { Button } from "@hjmds/react/actions";
import { Notice } from "@hjmds/react/feedback";
import { TextField } from "@hjmds/react/forms";
import { Switch } from "@hjmds/react/selection";
import { initialMockupScene, parseMockupScene, serializeMockupScene, sceneDimensions, type MockupScene } from "../../../shared/mockup-scene.js";
import { downloadStudioBlob, drawMockup, mockupPng } from "./draw-mockup.js";

const imageFailure = "이미지를 열지 못했어요. 20MB 이하 PNG·JPEG·WebP 파일을 선택해 주세요. 이전 화면은 유지됩니다.";
const sceneFailure = "장면 설정을 읽지 못했어요. 이 스튜디오에서 저장한 JSON 파일을 선택해 주세요.";

export function MockupStudio() {
  const [frame, setFrame] = useState(0);
  const [scene, setScene] = useState<MockupScene>(initialMockupScene);
  const [image, setImage] = useState<ImageBitmap | null>(null);
  const [status, setStatus] = useState("스크린샷을 선택해 시작하세요.");
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState<"image" | "scene" | "export" | null>(null);
  const [exporting, setExporting] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<ImageBitmap | null>(null);
  const request = useRef(0);
  const mounted = useRef(true);
  const pngOperation = useRef(0), pngPending = useRef(false);
  const pngButton = useRef<HTMLButtonElement>(null), retryButton = useRef<HTMLButtonElement>(null), retryFocus = useRef<HTMLElement|null>(null);
  useLayoutEffect(() => {
    if (exporting) return;
    // The retry Notice disappears during encoding. Return only its abandoned
    // keyboard focus; edits or explicit blur elsewhere keep their own focus.
    const previous = retryFocus.current;
    if (previous && !previous.isConnected && document.activeElement === document.body) (failure === "export" ? retryButton.current : pngButton.current)?.focus({preventScroll:true});
    retryFocus.current = null;
  }, [exporting, failure]);
  useEffect(() => {
    if (!exporting) return;
    const relinquish = () => { retryFocus.current = null; };
    document.addEventListener("focusin", relinquish); document.addEventListener("pointerdown", relinquish);
    return () => { document.removeEventListener("focusin", relinquish); document.removeEventListener("pointerdown", relinquish); };
  }, [exporting]);
  const retirePng = () => { retryFocus.current = null; ++pngOperation.current; pngPending.current = false; setExporting(false); };
  const patch = (value: Partial<MockupScene>) => setScene(current => ({ ...current, ...value }));
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; request.current++; pngOperation.current++; pngPending.current = false; imageRef.current?.close(); }; }, []);
  useEffect(() => { if (canvas.current) drawMockup(canvas.current, scene, image, sampleSceneTimeline(scene.timeline, frame, scene.seed)); }, [scene, image, frame]);
  async function load(file: File) {
    const id = ++request.current; retirePng(); setLoading(true); setFailure(null); setStatus("스크린샷을 여는 중이에요.");
    try {
      // Bound local decode work before allocating a canvas; no screenshot leaves this browser.
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 20 * 1024 * 1024) throw new Error("format");
      const bitmap = await createImageBitmap(file);
      if (id !== request.current) { bitmap.close(); return; }
      if (bitmap.width > 16384 || bitmap.height > 16384) { bitmap.close(); throw new Error("size"); }
      imageRef.current?.close(); imageRef.current = bitmap; setImage(bitmap);
      setScene(current => ({ ...current, asset: { ...current.asset, fileName: file.name } }));
      setStatus(`${file.name} · ${bitmap.width} × ${bitmap.height} 화면을 불러왔어요.`);
    } catch { if (id === request.current) { setFailure("image"); setStatus(imageFailure); } }
    finally { if (id === request.current) setLoading(false); }
  }
  async function loadScene(file: File) {
    const id = ++request.current; retirePng(); setLoading(true); setFailure(null); setStatus("장면 설정을 읽는 중이에요.");
    try {
      if (file.size > 65536) throw new Error("Scene file too large");
      const imported = parseMockupScene(await file.text());
      if (id !== request.current) return;
      // JSON carries metadata only; clear old pixels so a different scene cannot export the wrong capture.
      imageRef.current?.close(); imageRef.current = null; setImage(null); setScene(imported); setFrame(0);
      setStatus(`장면 설정을 불러왔어요. ${imported.asset.fileName || "원본 화면"} 파일을 다시 선택해 주세요.`);
    } catch { if (id === request.current) { setFailure("scene"); setStatus(sceneFailure); } }
    finally { if (id === request.current) setLoading(false); }
  }
  async function savePng() {
    if (!image || !canvas.current || loading || pngPending.current) return;
    // Ref locking covers repeated activations before React commits; a file change
    // or reset retires the result even when the browser cannot cancel PNG encoding.
    if (document.activeElement === retryButton.current) retryFocus.current = retryButton.current;
    const operation = ++pngOperation.current; pngPending.current = true;
    const current = () => mounted.current && operation === pngOperation.current;
    setExporting(true); setFailure(null);
    try {
      // Render a snapshot offscreen: editing during encoding cannot change the exported scene.
      const output = document.createElement("canvas"); drawMockup(output, scene, image, sampleSceneTimeline(scene.timeline, frame, scene.seed));
      const blob = await mockupPng(output);
      if (current()) { downloadStudioBlob(blob, "hjm-mockup.png"); setStatus("PNG 다운로드를 시작했어요."); }
    } catch { if (current()) { setFailure("export"); setStatus("PNG를 내보내지 못했어요. 다시 시도해 주세요."); } }
    finally { if (current()) { pngPending.current = false; setExporting(false); } }
  }
  const dimensions = sceneDimensions(scene.format);
  // FilePicker judges type/size with the same limits load()/loadScene() enforce; a rejection is the same
  // read failure the editor already reports beside the retained scene.
  const pick = (selection: FilePickerSelectionResult, files: ReadonlyMap<string, File>, open: (file: File) => Promise<void>, kind: "image" | "scene") => {
    const accepted = selection.accepted[0]; const file = accepted ? files.get(accepted.id) : undefined;
    if (file) void open(file);
    else if (selection.rejected.length) { request.current++; retirePng(); setLoading(false); setFailure(kind); setStatus(kind === "image" ? imageFailure : sceneFailure); }
  };
  // ScreenLayout owns the header band, body inset/scroll and width; the export row is its fixed footer so the
  // primary action stays reachable past the long settings list. Expanded windows place the preview beside the
  // settings (the preview stays in view via .mockup-studio sticky CSS keyed on the Grid's resolved columns).
  return <ScreenLayout title="목업 편집" description="실제 화면을 넣고, 내 제품에 맞는 소개 이미지를 만들어 보세요." presentation="dashboard"
    // File/export failures are non-blocking: ScreenLayout `notice` keeps them beside the retained editor and outside the
    // body, so the body focus recovery does not take a removed retry action's focus from the PNG restore below.
    notice={failure ? <Notice tone="danger" title={status} {...(failure === "export" ? { action: <Button ref={retryButton} tone="secondary" size="small" disabled={!image || loading} loading={exporting} onBlur={event => { if (event.relatedTarget || event.currentTarget.isConnected) retryFocus.current = null; }} onClick={() => void savePng()}>다시 내보내기</Button> } : {})} /> : null}
    footer={<Stack axis="inline" wrap gap="xs"><Button ref={pngButton} disabled={!image || loading || exporting} loading={exporting} onClick={() => void savePng()}>PNG 내보내기</Button><Button tone="secondary" onClick={() => downloadStudioBlob(new Blob([serializeMockupScene(scene)], { type: "application/json" }), "hjm-scene.json")}>장면 설정 저장</Button><Button tone="ghost" onClick={() => { request.current++; retirePng(); imageRef.current?.close(); imageRef.current = null; setImage(null); setScene(initialMockupScene); setFrame(0); setLoading(false); setFailure(null); setStatus("스크린샷을 선택해 시작하세요."); }}>초기화</Button></Stack>}>
    <Grid className="mockup-studio" columns={{ compact: 1, expanded: 2 }} gap={{ compact: "xl" }}>
      <Stack gap="sm" className="mockup-studio__preview">
        <Surface padding="md"><canvas ref={canvas} role="img" aria-label={`${scene.title}. ${scene.frame === "phone" ? "휴대폰" : "브라우저"} 프레임 목업 미리보기`} style={{ width: "100%", height: "auto", maxHeight: "70vh", objectFit: "contain" }}/></Surface>
        <Text tone="muted">출력 {dimensions.width} × {dimensions.height} · 원본 화면 전체를 유지해요.</Text>
      </Stack>
      <Stack gap="xl">
        <FilePicker descriptor={{ accept: ["image/png", "image/jpeg", "image/webp"], maxSizeBytes: 20 * 1024 * 1024 }} label="화면 캡처" buttonLabel="화면 캡처 선택" dropzoneLabel="PNG·JPEG·WebP 이미지를 여기에 놓아 주세요" onSelect={(selection, files) => pick(selection, files, load, "image")}/>
        <FilePicker descriptor={{ accept: ["application/json", ".json"], maxSizeBytes: 65536 }} label="장면 설정" buttonLabel="장면 설정 불러오기" dropzoneLabel="저장한 장면 JSON을 여기에 놓아 주세요" onSelect={(selection, files) => pick(selection, files, loadScene, "scene")}/>
        {failure ? null : <Text role="status">{status}</Text>}
        <SceneTimeline scene={scene} image={image} frame={frame} onFrame={setFrame} onTimeline={timeline => patch({ timeline })}/>
        <TextField label="제목" value={scene.title} maxLength={80} onValueChange={title => patch({ title })}/>
        <TextField label="설명" value={scene.subtitle} maxLength={120} onValueChange={subtitle => patch({ subtitle })}/>
        <SettingChoice label="출력 비율" options={["portrait", "square", "landscape"] as const} format={format => ({ portrait: "세로", square: "정사각형", landscape: "가로" })[format]} value={scene.format} onChange={format => patch({ format })}/>
        <SettingChoice label="프레임" options={["phone", "browser"] as const} format={frame => frame === "phone" ? "휴대폰" : "브라우저"} value={scene.frame} onChange={frame => patch({ frame })}/>
        <SettingChoice label="배경" options={["dawn", "ink", "mint"] as const} format={background => ({ dawn: "새벽", ink: "잉크", mint: "민트" })[background]} value={scene.background} onChange={background => patch({ background })}/>
        <SettingChoice label="각도" options={[-12, -6, 0, 6, 12]} format={angle => `${angle}°`} value={scene.angle} onChange={angle => patch({ angle })}/>
        <SettingChoice label="여백" options={[50, 90, 140]} format={padding => ({ 50: "좁게", 90: "보통", 140: "넓게" } as Record<number, string>)[padding] ?? `${padding}px`} value={scene.padding} onChange={padding => patch({ padding })}/>
        {/* On/off setting: Switch, not a selected Button (SELECTION.md 조립 규칙). */}
        <Switch presentation="row" label="그림자" checked={scene.shadow} onCheckedChange={shadow => patch({ shadow })}/>
        <TextField label="화면 출처" value={scene.asset.source} onValueChange={source => patch({ asset: { ...scene.asset, source } })}/>
        <TextField label="허용 사용 범위" value={scene.asset.usage} onValueChange={usage => patch({ asset: { ...scene.asset, usage } })}/>
        <Text tone="muted">브라우저 안에서만 편집합니다. 화면 파일은 업로드하지 않으며, 장면 설정에는 파일 이름과 출처만 저장합니다. 프레임은 직접 만든 공용 형태입니다.</Text>
      </Stack>
    </Grid>
  </ScreenLayout>;
}
