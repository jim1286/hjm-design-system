import { radius, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export function validateAssetDescriptor(descriptor) {
    if (!assetRecipe.kinds.includes(descriptor.kind)) {
        throw new TypeError(`Unsupported Asset kind: ${String(descriptor.kind)}`);
    }
    const decorative = descriptor.decorative ?? false;
    const label = descriptor.accessibilityLabel?.trim() ?? "";
    if (!decorative && label.length === 0) {
        throw new TypeError("A meaningful Asset must provide accessibilityLabel");
    }
    if (decorative && label.length > 0) {
        // 둘 다 주면 어느 쪽이 참인지 화면이 모른다. 조용히 무시하면 이름을 지운 줄 모른다.
        throw new TypeError("A decorative Asset must not provide accessibilityLabel");
    }
}
/**
 * 움직이는 자산은 `reducedMotion`에서 **첫 프레임(또는 포스터)로 정지**한다. 숨기지
 * 않는 이유: 그 자리에 그림이 있다는 사실 자체가 화면의 뜻인 경우가 많다(에어리의 동물).
 * 정지 화면을 제품이 주지 못하면 재생을 멈추기만 한다.
 */
export function shouldAnimateAsset(kind, reducedMotion) {
    return (kind === "lottie" || kind === "video") && !reducedMotion;
}
export const assetRecipe = {
    slots: ["root", "frame", "media", "accessory", "group"],
    kinds: ["icon", "image", "lottie", "video"],
    defaults: { size: "medium", shape: "rounded" },
    sizes: { small: 32, medium: 48, large: 72, xlarge: 120 },
    // 정사각은 모서리 0이다 — radius 토큰에 0이 없는 이유는 "모서리 없음"이 토큰이 아니라
    // 값의 부재이기 때문이다.
    shapes: { square: 0, rounded: radius.md, circle: radius.full },
    background: semanticColors.surface.sunken,
    border: semanticColors.border.default,
    /** 묶음으로 겹칠 때의 비율. Avatar와 같은 값을 쓴다 — 한 줄에 섞여 나오기 때문이다. */
    overlapRatio: 0.3,
    /** 보조 표식(재생 아이콘·상태 점)은 액자 **바깥 모서리**에 붙어 매체를 가리지 않는다. */
    accessory: { offset: spacing.xxs, gap: spacing.xxs },
};
export const assetBehavior = {
    /** 상태가 없다 — 액자는 값을 갖지 않고 슬롯만 받는다. */
    controlled: [],
    inputs: ["kind", "size", "shape", "decorative", "accessibilityLabel"],
    configuration: {
        kind: ["icon", "image", "lottie", "video"],
        shape: ["square", "rounded", "circle"],
        size: ["small", "medium", "large", "xlarge"],
    },
    stateAxes: { availability: ["enabled"] },
    web: { roles: ["img", "presentation"], keyboard: [], focus: "none" },
    native: { roles: ["image"], states: [], actions: [] },
    scenarios: [
        "one-frame-rule-covers-icon-image-lottie-and-video-so-a-mixed-row-lines-up",
        "the-package-never-depends-on-a-player-the-media-arrives-as-a-slot",
        "a-meaningful-asset-without-a-name-is-rejected-instead-of-silently-decorative",
        "reduced-motion-freezes-the-frame-rather-than-removing-the-asset",
        "an-accessory-sits-on-the-frames-outer-corner-and-never-covers-the-media",
    ],
};
//# sourceMappingURL=asset.js.map