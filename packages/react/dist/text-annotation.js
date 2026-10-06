import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from '@hjmds/design-contracts/foundations';
import { resolveTextAnnotationGeometry } from '@hjmds/design-contracts/text-annotation';
import { useLayoutEffect, useRef, useState } from 'react';
import { useHjmTheme } from './provider.js';
export function TextAnnotation({ children, action = 'highlight' }) {
    const { environment } = useHjmTheme();
    const textRef = useRef(null);
    const anchorRef = useRef(null);
    const svgRef = useRef(null);
    const played = useRef(null);
    const measured = useRef('');
    const [measurement, setMeasurement] = useState({ content: children, lines: [] });
    // A new string must not briefly receive paths measured for the old string.
    const lines = measurement.content === children ? measurement.lines : [];
    const geometry = resolveTextAnnotationGeometry(lines, action);
    const key = `${action}:${children}`;
    useLayoutEffect(() => {
        const text = textRef.current, anchor = anchorRef.current;
        if (!text || !anchor)
            return;
        let frame = 0, alive = true;
        const measure = () => {
            frame = 0;
            if (!alive)
                return;
            const origin = anchor.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(text);
            // Range rectangles are actual shaped fragments, including mixed-direction
            // runs. An inline-block or character-width estimate changes line wrapping.
            const next = Array.from(range.getClientRects()).filter(rect => rect.width > 0 && rect.height > 0).map(rect => ({ x: rect.left - origin.left, y: rect.top - origin.top, width: rect.width, height: rect.height }));
            const signature = JSON.stringify([children, next]);
            if (measured.current !== signature) {
                measured.current = signature;
                setMeasurement({ content: children, lines: next });
            }
        };
        const schedule = () => { if (!frame)
            frame = requestAnimationFrame(measure); };
        measure();
        const observer = new ResizeObserver(schedule);
        const mutation = new MutationObserver(records => {
            if (records.some(record => !anchor.contains(record.target)))
                schedule();
        });
        // Inline fragments themselves may not emit ResizeObserver notifications.
        // Observe ancestors too: a preceding sibling can move the first fragment
        // without changing its text or font.
        for (let element = text; element; element = element.parentElement) {
            observer.observe(element);
            mutation.observe(element, { attributes: true, attributeFilter: ['style', 'class', 'dir'] });
        }
        const paragraph = text.closest('p, h1, h2, h3, h4, h5, h6, li') ?? text.parentElement?.parentElement;
        // Ignore our SVG's mutations; measuring it would create an observer loop.
        if (paragraph)
            mutation.observe(paragraph, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'dir'] });
        document.fonts.addEventListener('loadingdone', schedule);
        void document.fonts.ready.then(() => { if (alive)
            schedule(); });
        window.addEventListener('resize', schedule);
        return () => { alive = false; cancelAnimationFrame(frame); observer.disconnect(); mutation.disconnect(); document.fonts.removeEventListener('loadingdone', schedule); window.removeEventListener('resize', schedule); };
    }, [children, environment.textScale, environment.direction]);
    useLayoutEffect(() => {
        const svg = svgRef.current;
        if (!svg || !geometry.paths.length || played.current === key)
            return;
        played.current = key;
        // Geometry updates are not new content. Do not replay entry motion on every
        // ResizeObserver delivery, unlike the upstream hide/show-on-body-resize path.
        if (environment.reducedMotion || document.hidden)
            return;
        const animations = [];
        for (const path of svg.querySelectorAll('path')) {
            if (action === 'highlight') {
                const start = environment.direction === 'rtl' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
                animations.push(path.animate([{ clipPath: start }, { clipPath: 'inset(0 0 0 0)' }], { duration: motion.slow, easing: 'ease-out' }));
            }
            else {
                const length = path.getTotalLength();
                animations.push(path.animate([{ strokeDasharray: `${length}`, strokeDashoffset: length }, { strokeDasharray: `${length}`, strokeDashoffset: 0 }], { duration: motion.slow, easing: 'ease-out' }));
            }
        }
        const stop = () => { for (const animation of animations)
            animation.cancel(); };
        const visibility = () => { if (document.hidden)
            stop(); };
        document.addEventListener('visibilitychange', visibility);
        return () => { stop(); document.removeEventListener('visibilitychange', visibility); };
    }, [key, lines, action, environment.reducedMotion, environment.direction, geometry.paths.length]);
    const bounds = geometry.bounds;
    return _jsxs("span", { "data-hjm-text-annotation": action, style: { display: 'inline', position: 'relative', isolation: 'isolate' }, children: [_jsx("span", { ref: anchorRef, "aria-hidden": "true", style: { position: 'absolute', left: 0, top: 0, width: 0, height: 0, pointerEvents: 'none' }, children: bounds ? _jsx("svg", { ref: svgRef, "aria-hidden": "true", focusable: "false", width: bounds.width, height: bounds.height, viewBox: `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`, style: { position: 'absolute', left: bounds.x, top: bounds.y, overflow: 'visible', pointerEvents: 'none' }, children: geometry.paths.map((path, index) => _jsx("path", { d: path.d, "data-line": path.lineIndex, fill: path.paint === 'fill' ? 'var(--hjm-color-primary)' : 'none', fillOpacity: path.paint === 'fill' ? 0.2 : 1, stroke: path.paint === 'stroke' ? 'var(--hjm-color-content-brand)' : 'none', strokeWidth: path.strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" }, index)) }) : null }), _jsx("span", { ref: textRef, "data-hjm-annotation-text": "", style: { position: 'relative' }, children: children })] });
}
//# sourceMappingURL=text-annotation.js.map