/** Independently authored decorative forms; no reference-site engine or presets. */
export function buildOrbPresentation(appearance, size, time) {
    const dots = [];
    const center = size / 2;
    if (appearance === 'matrix') {
        // Fixed 9×9 maximum bounds frame cost on both 20px and 64px surfaces.
        for (let row = 0; row < 9; row++)
            for (let column = 0; column < 9; column++) {
                const x = (column - 4) / 4, y = (row - 4) / 4, distance = Math.hypot(x, y);
                if (distance > 1)
                    continue;
                const wave = (Math.sin(time * 2 - distance * 5 + column * .3) + 1) / 2;
                dots.push({ x: center + x * size * .38, y: center + y * size * .38, z: 0, r: size * (.012 + .016 * wave), white: 1 - (.3 + .7 * wave), a: 1 });
            }
    }
    else {
        // Six organic rings keep a bounded silhouette without expensive blur/shader passes.
        for (let ring = 1; ring <= 6; ring++)
            for (let point = 0; point < 32; point++) {
                const angle = point * Math.PI / 16;
                const wave = 1 + .09 * Math.sin(angle * 3 + time * 1.4 + ring * .5);
                const distance = size * .38 * ring / 6 * wave;
                dots.push({ x: center + Math.cos(angle) * distance, y: center + Math.sin(angle) * distance, z: ring, r: size * .012, white: .15 + ring * .08, a: 1 });
            }
    }
    return { dots, lines: [] };
}
//# sourceMappingURL=presentation.js.map