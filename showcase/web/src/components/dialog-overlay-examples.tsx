// 1.31 Dialog companions: the decorative layer outside the card (BurnTok folder drag ghost) and the edge-to-edge
// presentation (utilverse display board). Shared preview module; stories import it, never each other.
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Button as HjmButton, IconButton as HjmIconButton } from "@hjmds/react/actions";
import { Stack as HjmStack, Text as HjmText } from "@hjmds/react/layout";
import { Dialog as HjmDialog, ImmersiveOverlay as HjmImmersiveOverlay } from "@hjmds/react/overlays";

const apps = ["메모", "날씨", "계산기"] as const;
type Drag = Readonly<{ label: string; x: number; y: number }>;

export function DialogOverlayLayerPreview() {
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState<Drag | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const move = (event: ReactPointerEvent) => setDrag(current => current && { ...current, x: event.clientX, y: event.clientY });
  return <HjmStack>
    <HjmText>폴더 안 항목을 끌면 카드 밖까지 따라오는 미리보기가 그려져요.</HjmText>
    <HjmButton ref={trigger} onClick={() => setOpen(true)}>폴더 열기</HjmButton>
    <HjmDialog open={open} onOpenChange={next => { setDrag(null); setOpen(next); }} returnFocusRef={trigger} title="즐겨 쓰는 앱" closeLabel="폴더 닫기"
      // The card keeps its scroll offset while a tile is dragged (scrollEnabled, 1.31).
      scrollEnabled={drag === null}
      // Viewport coordinates from the pointer event; the layer is decorative, so the tiles stay the drag targets.
      overlayLayer={drag ? <div style={{ position: "absolute", left: drag.x - 28, top: drag.y - 28, inlineSize: 56, blockSize: 56, display: "grid", placeItems: "center",
        borderRadius: "var(--hjm-radius-md)", background: "var(--hjm-color-surface-accent)", boxShadow: "var(--hjm-dialog-shadow)" }}>{drag.label}</div> : null}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--hjm-space-sm)", touchAction: "none" }}
        onPointerMove={move} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)}>
        {apps.map(label => <HjmButton key={label} tone="secondary" onPointerDown={event => {
          event.currentTarget.parentElement?.setPointerCapture(event.pointerId);
          setDrag({ label, x: event.clientX, y: event.clientY });
        }}>{label}</HjmButton>)}
      </div>
    </HjmDialog>
  </HjmStack>;
}

export function ImmersiveOverlayPreview() {
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return <HjmStack>
    <HjmText>전광판처럼 화면 전체를 채워 보여 주고, 닫기와 Escape로 돌아와요.</HjmText>
    <HjmButton ref={trigger} onClick={() => setOpen(true)}>전광판 보기</HjmButton>
    <HjmImmersiveOverlay open={open} onOpenChange={setOpen} returnFocusRef={trigger} label="전광판" exitLabel="전광판 닫기"
      status={<HjmText>{paused ? "멈춤" : "흐르는 중"}</HjmText>}
      tools={<HjmIconButton label={paused ? "다시 흐르기" : "멈추기"} tone="secondary" size="large" onClick={() => setPaused(!paused)}>{paused ? "▶" : "Ⅱ"}</HjmIconButton>}>
      {/* The stage is product output: its colours come from the theme, sized to the viewport. */}
      <div style={{ blockSize: "100%", display: "grid", placeItems: "center", background: "var(--hjm-color-text)", color: "var(--hjm-color-bg)" }}>
        <span style={{ fontSize: "min(20vw, 12rem)", fontWeight: 700 }}>환영해요</span>
      </div>
    </HjmImmersiveOverlay>
  </HjmStack>;
}
