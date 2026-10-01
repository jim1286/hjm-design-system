import { SceneTimeline } from "./SceneTimeline";
import { sampleSceneTimeline } from "../../../shared/scene-timeline";
import { useEffect, useRef, useState } from "react";
import { Stack, Surface, Text } from "@hjmds/react/layout";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { initialMockupScene, parseMockupScene, serializeMockupScene, sceneDimensions, type MockupScene } from "../../../shared/mockup-scene";
import { downloadStudioBlob, drawMockup, mockupPng } from "./draw-mockup";

export function MockupStudio() {
  const [frame, setFrame] = useState(0);
  const [scene, setScene] = useState<MockupScene>(initialMockupScene);
  const [image, setImage] = useState<ImageBitmap | null>(null);
  const [status, setStatus] = useState("스크린샷을 선택해 시작하세요.");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<ImageBitmap | null>(null);
  const request = useRef(0);
  const mounted = useRef(true);
  const patch = (value: Partial<MockupScene>) => setScene(current => ({ ...current, ...value }));
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; request.current++; imageRef.current?.close(); }; }, []);
  useEffect(() => { if (canvas.current) drawMockup(canvas.current, scene, image, sampleSceneTimeline(scene.timeline, frame, scene.seed)); }, [scene, image, frame]);
  async function load(file: File) {
    const id = ++request.current; setLoading(true); setStatus("스크린샷을 여는 중이에요.");
    try {
      // Bound local decode work before allocating a canvas; no screenshot leaves this browser.
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 20 * 1024 * 1024) throw new Error("format");
      const bitmap = await createImageBitmap(file);
      if (id !== request.current) { bitmap.close(); return; }
      if (bitmap.width > 16384 || bitmap.height > 16384) { bitmap.close(); throw new Error("size"); }
      imageRef.current?.close(); imageRef.current = bitmap; setImage(bitmap);
      setScene(current => ({ ...current, asset: { ...current.asset, fileName: file.name } }));
      setStatus(`${file.name} · ${bitmap.width} × ${bitmap.height} 화면을 불러왔어요.`);
    } catch { if (id === request.current) setStatus("이미지를 열지 못했어요. 20MB 이하 PNG·JPEG·WebP 파일을 선택해 주세요. 이전 화면은 유지됩니다."); }
    finally { if (id === request.current) setLoading(false); }
  }
  async function loadScene(file: File) {
    const id = ++request.current; setLoading(true);
    try {
      if (file.size > 65536) throw new Error("Scene file too large");
      const imported = parseMockupScene(await file.text());
      if (id !== request.current) return;
      // JSON carries metadata only; clear old pixels so a different scene cannot export the wrong capture.
      imageRef.current?.close(); imageRef.current = null; setImage(null); setScene(imported); setFrame(0);
      setStatus(`장면 설정을 불러왔어요. ${imported.asset.fileName || "원본 화면"} 파일을 다시 선택해 주세요.`);
    } catch { if (id === request.current) setStatus("장면 설정을 읽지 못했어요. 이 스튜디오에서 저장한 JSON 파일을 선택해 주세요."); }
    finally { if (id === request.current) setLoading(false); }
  }
  async function savePng() {
    if (!image || !canvas.current || loading || exporting) return;
    setExporting(true);
    try {
      // Render a snapshot offscreen: editing during encoding cannot change the exported scene.
      const output = document.createElement("canvas"); drawMockup(output, scene, image, sampleSceneTimeline(scene.timeline, frame, scene.seed));
      const blob = await mockupPng(output);
      if (mounted.current) { downloadStudioBlob(blob, "hjm-mockup.png"); setStatus("PNG 이미지를 내보냈어요."); }
    } catch { if (mounted.current) setStatus("PNG를 내보내지 못했어요. 다시 시도해 주세요."); }
    finally { if (mounted.current) setExporting(false); }
  }
  const dimensions = sceneDimensions(scene.format);
  return <main><Stack gap="xl">
    <Stack gap="sm"><Text variant="heading">목업 스튜디오</Text><Text>실제 화면을 넣고, 내 제품에 맞는 소개 이미지를 만들어 보세요.</Text></Stack>
    <Surface padding="md"><canvas ref={canvas} role="img" aria-label={`${scene.title}. ${scene.frame === "phone" ? "휴대폰" : "브라우저"} 프레임 목업 미리보기`} style={{ width: "100%", height: "auto", maxHeight: "70vh", objectFit: "contain" }}/></Surface>
    <Text tone="muted">출력 {dimensions.width} × {dimensions.height} · 원본 화면 전체를 유지해요.</Text>
    <label>화면 캡처<input aria-label="화면 캡처" type="file" accept="image/png,image/jpeg,image/webp" style={{ width: "100%", maxWidth: "100%" }} onChange={event => { const file = event.target.files?.[0]; if (file) void load(file); event.target.value = ""; }}/></label>
    <label>장면 설정 불러오기<input aria-label="장면 설정 불러오기" type="file" accept="application/json,.json" style={{ width: "100%", maxWidth: "100%" }} onChange={event => { const file = event.target.files?.[0]; if (file) void loadScene(file); event.target.value = ""; }}/></label>
    <Text role="status">{status}</Text>
    <SceneTimeline scene={scene} image={image} frame={frame} onFrame={setFrame} onTimeline={timeline => patch({ timeline })}/>
    <TextField label="제목" value={scene.title} maxLength={80} onValueChange={title => patch({ title })}/>
    <TextField label="설명" value={scene.subtitle} maxLength={120} onValueChange={subtitle => patch({ subtitle })}/>
    <Text emphasis="strong">출력 비율</Text><Stack axis="inline" wrap gap="sm">{([ ["portrait", "세로"], ["square", "정사각형"], ["landscape", "가로"] ] as const).map(([format, label]) => <Button key={format} selected={scene.format === format} tone="secondary" onClick={() => patch({ format })}>{label}</Button>)}</Stack>
    <Text emphasis="strong">프레임</Text><Stack axis="inline" wrap gap="sm">{([ ["phone", "휴대폰"], ["browser", "브라우저"] ] as const).map(([frame, label]) => <Button key={frame} selected={scene.frame === frame} tone="secondary" onClick={() => patch({ frame })}>{label}</Button>)}</Stack>
    <Text emphasis="strong">배경</Text><Stack axis="inline" wrap gap="sm">{([ ["dawn", "새벽"], ["ink", "잉크"], ["mint", "민트"] ] as const).map(([background, label]) => <Button key={background} selected={scene.background === background} tone="secondary" onClick={() => patch({ background })}>{label}</Button>)}</Stack>
    <Text emphasis="strong">각도</Text><Stack axis="inline" wrap gap="sm">{[-12, -6, 0, 6, 12].map(angle => <Button key={angle} selected={scene.angle === angle} tone="ghost" onClick={() => patch({ angle })}>{angle}°</Button>)}</Stack>
    <Text emphasis="strong">여백</Text><Stack axis="inline" wrap gap="sm">{([ [50, "좁게"], [90, "보통"], [140, "넓게"] ] as const).map(([padding, label]) => <Button key={padding} selected={scene.padding === padding} tone="ghost" onClick={() => patch({ padding })}>{label}</Button>)}</Stack>
    <Button tone="secondary" selected={scene.shadow} onClick={() => patch({ shadow: !scene.shadow })}>그림자</Button>
    <TextField label="화면 출처" value={scene.asset.source} onValueChange={source => patch({ asset: { ...scene.asset, source } })}/>
    <TextField label="허용 사용 범위" value={scene.asset.usage} onValueChange={usage => patch({ asset: { ...scene.asset, usage } })}/>
    <Stack axis="inline" wrap gap="sm"><Button disabled={!image || loading || exporting} onClick={() => void savePng()}>{exporting ? "내보내는 중" : "PNG 내보내기"}</Button><Button tone="secondary" onClick={() => downloadStudioBlob(new Blob([serializeMockupScene(scene)], { type: "application/json" }), "hjm-scene.json")}>장면 설정 저장</Button><Button tone="ghost" onClick={() => { request.current++; imageRef.current?.close(); imageRef.current = null; setImage(null); setScene(initialMockupScene); setFrame(0); setLoading(false); setStatus("스크린샷을 선택해 시작하세요."); }}>초기화</Button></Stack>
    <Text tone="muted">브라우저 안에서만 편집합니다. 화면 파일은 업로드하지 않으며, 장면 설정에는 파일 이름과 출처만 저장합니다. 프레임은 직접 만든 공용 형태입니다.</Text>
  </Stack></main>;
}
