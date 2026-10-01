import { resolveMockupLayout, type MockupScene } from "../../../shared/mockup-scene";
const palettes = {
  dawn: { start: "#f5e9de", end: "#ded8ef", ink: "#28232f", accent: "#b392df" },
  ink: { start: "#101c29", end: "#273749", ink: "#f6f4ee", accent: "#6699b9" },
  mint: { start: "#e3f3eb", end: "#b9d9cc", ink: "#203b33", accent: "#73ae99" },
} as const;
function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath(); ctx.roundRect(x, y, width, height, radius);
}
function lines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  // Grapheme segmentation preserves emoji/combining sequences in wrapped promotional copy.
  const units = [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)].map(unit => unit.segment);
  const result: string[] = []; let line = "";
  for (const unit of units) { if (line && ctx.measureText(line + unit).width > maxWidth) { result.push(line); line = unit; } else line += unit; }
  if (line) result.push(line);
  return result;
}
/** One drawing path for preview, still export and forthcoming timeline frames. */
export function drawMockup(canvas: HTMLCanvasElement, scene: MockupScene, image: ImageBitmap | null, motion = { angle: 0, lift: 0, scale: 1 }) {
  const box = resolveMockupLayout(scene); const palette = palettes[scene.background];
  if (canvas.width !== box.width) canvas.width = box.width;
  if (canvas.height !== box.height) canvas.height = box.height;
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas is unavailable");
  ctx.clearRect(0, 0, box.width, box.height);
  const gradient = ctx.createLinearGradient(0, 0, box.width, box.height); gradient.addColorStop(0, palette.start); gradient.addColorStop(1, palette.end);
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, box.width, box.height);
  ctx.save(); ctx.globalAlpha = 0.13; ctx.fillStyle = palette.accent;
  const phase = scene.seed / 65535;
  ctx.beginPath(); ctx.ellipse(box.width * (0.72 + phase * 0.08), box.height * 0.65, box.width * 0.62, box.height * 0.38, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.fillStyle = palette.ink; ctx.textBaseline = "top";
  // Fit full user copy into reserved editorial space; never silently truncate exported words.
  let fontSize = 58; let heading: string[];
  do { ctx.font = `600 ${fontSize}px system-ui, sans-serif`; heading = lines(ctx, scene.title, box.width - scene.padding * 2); if (heading.length * fontSize * 1.2 <= 150) break; fontSize -= 2; } while (fontSize > 20);
  heading.forEach((line, index) => ctx.fillText(line, scene.padding, scene.padding + index * fontSize * 1.2));
  ctx.font = "400 24px system-ui, sans-serif";
  lines(ctx, scene.subtitle, box.width - scene.padding * 2).forEach((line, index) => ctx.fillText(line, scene.padding, scene.padding + 162 + index * 30));
  ctx.save(); ctx.translate(box.centerX, box.centerY + motion.lift); ctx.rotate((scene.angle + motion.angle) * Math.PI / 180); ctx.scale(motion.scale, motion.scale);
  const fw = box.frameWidth, fh = box.frameHeight; const x = -fw / 2, y = -fh / 2; const radius = scene.frame === "phone" ? fw * 0.085 : 18;
  if (scene.shadow) { ctx.shadowColor = "#10172355"; ctx.shadowBlur = 45; ctx.shadowOffsetY = 24; }
  ctx.fillStyle = "#24282d"; rounded(ctx, x, y, fw, fh, radius); ctx.fill();
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  const border = scene.frame === "phone" ? 12 : 10; const top = scene.frame === "phone" ? 12 : 38;
  const sx = x + border, sy = y + top, sw = fw - border * 2, sh = fh - top - border;
  ctx.save(); rounded(ctx, sx, sy, sw, sh, scene.frame === "phone" ? Math.max(0, radius - border) : 6); ctx.clip(); ctx.fillStyle = "#edf0f2"; ctx.fillRect(sx, sy, sw, sh);
  if (image) {
    // Contain preserves every pixel of the actual screenshot, including navigation and status bars.
    const ratio = Math.min(sw / image.width, sh / image.height); const iw = image.width * ratio, ih = image.height * ratio;
    ctx.drawImage(image, sx + (sw - iw) / 2, sy + (sh - ih) / 2, iw, ih);
  } else {
    ctx.fillStyle = "#6d747c"; ctx.font = "400 20px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText("스크린샷을 선택해 주세요", 0, 0);
  }
  ctx.restore();
  if (scene.frame === "browser") { ctx.fillStyle = "#a8adb3"; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + 20 + i * 15, y + 19, 4, 0, Math.PI * 2); ctx.fill(); } }
  ctx.restore();
}
export function downloadStudioBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function mockupPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG encoding failed")), "image/png"));
}
