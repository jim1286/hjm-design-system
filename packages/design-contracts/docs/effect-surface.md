# Composable decorative surfaces

2026-10-01. Optional Web/Native presentation, independent implementation inspired
by layered shader composition. No Shaders.com engine, presets or source is shipped.

Import `EffectSurface` from the renderer `/effect-surface` entry. The shared
`/effect-surface` contract accepts unique `layers` (`mesh`, `glow`, `grain`), a
stable `seed`, `intensity` from 0 to 1, a cycle `period` from 2 to 120 seconds,
`active` (false by default), and three semantic color references. Web uses local
SVG/WAAPI; Native requires the existing optional SVG peer and core Animated.
No WebGPU context, network request or new native animation runtime is required.

```tsx
<EffectSurface descriptor={{ layers: ['mesh', 'grain'], seed: 'welcome', active: true }}>
  <WelcomeContent />
</EffectSurface>
```

Web accepts `className`; Native accepts container `style` and host `visible`.
Native screen/list owners must pass `visible={false}` when hidden or outside the
visible list window. Web observes intersection and document visibility. Both
honor the HJM provider's reduced-motion setting; Native also handles AppState.
The static seeded geometry and the base theme background stay visible when motion
stops. Effects never duplicate content, take focus, intercept touches or add an
accessible name. The content itself stays in normal layout.

Noise uses a seeded repeating small-dot tile rather than large spots. Geometry
is shared, while host rasterization and transform details can differ. This is
atmospheric parity, not a pixel-identical renderer promise. Motion is opt-in and
slow by default to avoid adding continuous work to ordinary content screens.
Use `active` only while an effect matters; avoid many simultaneously moving rows.

The component does not automatically guarantee text contrast across arbitrary
brand colors/intensities. Verify the actual composition or put important text
and controls on an opaque HJM Surface. The fallback background is the current
provider background, not an independently selected palette.

`갤러리/시각 효과` demonstrates layers separately and together.
This optional surface is supplemental presentation; it does not add another
canonical Surface or replace ThinkingOrb's actual-work state semantics.


Host failure fallback (2026-10-02): if Web animation creation is rejected, the SVG
stays static and no visibility event repeatedly retries it. Native SVG/Animated
render errors remove only the decoration until the surface remounts; product
children keep their state and remain interactive on the base theme background.
A failed Native foreground animation start keeps the static decoration and stops
retrying for that effect lifecycle. Descriptor validation stays outside this
fallback so invalid caller input is still reported. This implements integration
plan §5's requirement that decorative failures must not remove product content.
