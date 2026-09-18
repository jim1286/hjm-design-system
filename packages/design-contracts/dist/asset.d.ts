/**
 * 아이콘·이미지·Lottie·비디오를 **같은 액자**에 넣는 자리.
 *
 * Icon·Image·Avatar가 이미 있는데 왜 또 두는가: 세 컴포넌트는 각자 다른 모양 규칙을 갖고
 * 있고(아이콘은 정사각, Avatar는 원, Image는 비율), 화면에서 이들이 **같은 줄에 섞여**
 * 나올 때 크기와 모서리가 어긋난다. Diairy의 `LottieArt`·`AnimalArt`가 그 어긋남을
 * 제품 안에서 다시 맞추고 있었다. Asset은 그 액자 규칙만 갖고, **무엇을 그릴지는 슬롯으로
 * 받는다** — Lottie와 비디오 재생기를 이 패키지가 의존하지 않기 위해서다.
 *
 * 그래서 이 계약에 재생 상태(play/pause/seek)가 없다. 재생기는 제품 것이고, 여기서
 * 정하는 것은 액자·크기·겹침·보조 표식뿐이다.
 */
export type AssetMediaKind = "icon" | "image" | "lottie" | "video";
export type AssetShape = "square" | "rounded" | "circle";
export type AssetSize = "small" | "medium" | "large" | "xlarge";
export type AssetDescriptor = Readonly<{
    kind: AssetMediaKind;
    size?: AssetSize;
    shape?: AssetShape;
    /**
     * 장식이면 `true`. 장식이 아닌데 이름이 없으면 거절한다 — 움직이는 그림일수록
     * "무엇을 뜻하는지"가 화면에 없으면 보조기기에서 사라진다.
     */
    decorative?: boolean;
    accessibilityLabel?: string;
}>;
export declare function validateAssetDescriptor(descriptor: AssetDescriptor): void;
/**
 * 움직이는 자산은 `reducedMotion`에서 **첫 프레임(또는 포스터)로 정지**한다. 숨기지
 * 않는 이유: 그 자리에 그림이 있다는 사실 자체가 화면의 뜻인 경우가 많다(에어리의 동물).
 * 정지 화면을 제품이 주지 못하면 재생을 멈추기만 한다.
 */
export declare function shouldAnimateAsset(kind: AssetMediaKind, reducedMotion: boolean): boolean;
export declare const assetRecipe: {
    readonly slots: readonly ["root", "frame", "media", "accessory", "group"];
    readonly kinds: readonly ["icon", "image", "lottie", "video"];
    readonly defaults: {
        readonly size: "medium";
        readonly shape: "rounded";
    };
    readonly sizes: {
        readonly small: 32;
        readonly medium: 48;
        readonly large: 72;
        readonly xlarge: 120;
    };
    readonly shapes: {
        readonly square: 0;
        readonly rounded: 12;
        readonly circle: 999;
    };
    readonly background: Readonly<{
        source: "theme";
        key: "surfaceAlt";
        alpha?: number;
    }>;
    readonly border: Readonly<{
        source: "theme";
        key: "border";
        alpha?: number;
    }>;
    /** 묶음으로 겹칠 때의 비율. Avatar와 같은 값을 쓴다 — 한 줄에 섞여 나오기 때문이다. */
    readonly overlapRatio: 0.3;
    /** 보조 표식(재생 아이콘·상태 점)은 액자 **바깥 모서리**에 붙어 매체를 가리지 않는다. */
    readonly accessory: {
        readonly offset: 4;
        readonly gap: 4;
    };
};
export declare const assetBehavior: {
    /** 상태가 없다 — 액자는 값을 갖지 않고 슬롯만 받는다. */
    readonly controlled: readonly [];
    readonly inputs: readonly ["kind", "size", "shape", "decorative", "accessibilityLabel"];
    readonly configuration: {
        readonly kind: readonly ["icon", "image", "lottie", "video"];
        readonly shape: readonly ["square", "rounded", "circle"];
        readonly size: readonly ["small", "medium", "large", "xlarge"];
    };
    readonly stateAxes: {
        readonly availability: readonly ["enabled"];
    };
    readonly web: {
        readonly roles: readonly ["img", "presentation"];
        readonly keyboard: readonly [];
        readonly focus: "none";
    };
    readonly native: {
        readonly roles: readonly ["image"];
        readonly states: readonly [];
        readonly actions: readonly [];
    };
    readonly scenarios: readonly ["one-frame-rule-covers-icon-image-lottie-and-video-so-a-mixed-row-lines-up", "the-package-never-depends-on-a-player-the-media-arrives-as-a-slot", "a-meaningful-asset-without-a-name-is-rejected-instead-of-silently-decorative", "reduced-motion-freezes-the-frame-rather-than-removing-the-asset", "an-accessory-sits-on-the-frames-outer-corner-and-never-covers-the-media"];
};
//# sourceMappingURL=asset.d.ts.map