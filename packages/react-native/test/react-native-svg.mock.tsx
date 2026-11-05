import { createElement, forwardRef, type ReactNode } from "react";

// The real react-native-svg needs the native runtime (Node cannot load its React Native Flow sources). Core controls
// draw Lucide marks through it since Lucide became the only icon source (2026-11-05), so every renderer test gets these
// named hosts; a test that inspects SVG geometry may still vi.mock its own shapes.
type HostProps = Readonly<Record<string, unknown>> & Readonly<{ children?: ReactNode }>;

function host(name: string) {
  const Host = forwardRef<unknown, HostProps>(function SvgHost({ children, ...props }, ref) {
    return createElement(name, { ...props, ref }, children as ReactNode);
  });
  Host.displayName = name;
  return Host;
}

export const Svg = host("Svg");
export default Svg;
export const Circle = host("Circle");
export const ClipPath = host("ClipPath");
export const Defs = host("Defs");
export const Ellipse = host("Ellipse");
export const G = host("G");
export const Image = host("Image");
export const Line = host("Line");
export const LinearGradient = host("LinearGradient");
export const Mask = host("Mask");
export const Path = host("Path");
export const Pattern = host("Pattern");
export const Polygon = host("Polygon");
export const Polyline = host("Polyline");
export const RadialGradient = host("RadialGradient");
export const Rect = host("Rect");
export const Stop = host("Stop");
export const Text = host("SvgText");
export const TSpan = host("TSpan");
export const Use = host("Use");
