import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Blobatar } from '@blobatar/react';
import { idle, happy, sad, surprised, wink, sleepy, thinking } from 'blobatar/expression';
import 'blobatar/motion.css';
import { resolveBlobatarMotion } from '@hjmds/design-contracts/avatar-fallback';
import { useHjmTheme } from './provider.js';
const expressions = { idle, happy, sad, surprised, wink, sleepy, thinking };
function Artwork({ size, options }) {
    const spec = resolveBlobatarMotion(options);
    const { environment } = useHjmTheme();
    const host = useRef(null);
    const [visible, setVisible] = useState(false);
    const [foreground, setForeground] = useState(false);
    useEffect(() => { const update = () => setForeground(!document.hidden); update(); document.addEventListener('visibilitychange', update); const observer = new IntersectionObserver(entries => setVisible(entries.some(e => e.isIntersecting))); if (host.current)
        observer.observe(host.current); return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); }; }, []);
    const active = spec.active && spec.visible && visible && foreground && !environment.reducedMotion;
    return _jsx("span", { ref: host, "aria-hidden": "true", style: { display: 'block' }, children: _jsx(Blobatar, { name: spec.seed, size: size, normalize: false, expression: expressions[spec.expression], animate: active ? 'always' : false, alt: "", "aria-hidden": "true" }) });
}
/** Optional animated entry. Static avatar imports never load motion CSS. */
export function createAnimatedBlobatarFallback(options) { resolveBlobatarMotion(options); return ({ size }) => _jsx(Artwork, { size: size, options: options }); }
//# sourceMappingURL=avatar-blobatar-motion.js.map