import { type ComponentCatalogEntry, type ComponentStatus, type ComponentSurfaceMaturity } from "./catalog.js";
import type { ResolvedTheme } from "./colors.js";
import type { DesignSystemDirection, DesignSystemEnvironmentInput } from "./design-system-provider.js";
export type ShowcaseTheme = ResolvedTheme;
export type ShowcaseDirection = DesignSystemDirection;
/** Closed fixture subset of the Provider's continuous text-scale signal. */
export type ShowcaseTextScale = 1 | 1.5 | 2;
export type ShowcaseMotionPreference = "full" | "reduced";
export type ShowcaseEnvironment = Readonly<{
    id: "default" | "dark" | "large-text" | "rtl" | "reduced-motion";
    label: string;
    theme: ShowcaseTheme;
    direction: ShowcaseDirection;
    textScale: ShowcaseTextScale;
    motion: ShowcaseMotionPreference;
}>;
/**
 * A small, deliberate environment matrix catches the high-risk differences
 * without multiplying every story into an unreadable Cartesian product.
 */
export declare const showcaseEnvironmentMatrix: readonly [{
    readonly id: "default";
    readonly label: "밝게 · 왼쪽→오른쪽 · 100%";
    readonly theme: "light";
    readonly direction: "ltr";
    readonly textScale: 1;
    readonly motion: "full";
}, {
    readonly id: "dark";
    readonly label: "어둡게 · 왼쪽→오른쪽 · 100%";
    readonly theme: "dark";
    readonly direction: "ltr";
    readonly textScale: 1;
    readonly motion: "full";
}, {
    readonly id: "large-text";
    readonly label: "밝게 · 왼쪽→오른쪽 · 200%";
    readonly theme: "light";
    readonly direction: "ltr";
    readonly textScale: 2;
    readonly motion: "full";
}, {
    readonly id: "rtl";
    readonly label: "밝게 · 오른쪽→왼쪽 · 100%";
    readonly theme: "light";
    readonly direction: "rtl";
    readonly textScale: 1;
    readonly motion: "full";
}, {
    readonly id: "reduced-motion";
    readonly label: "밝게 · 왼쪽→오른쪽 · 동작 줄이기";
    readonly theme: "light";
    readonly direction: "ltr";
    readonly textScale: 1;
    readonly motion: "reduced";
}];
/** Bridges documentation fixtures to the same environment contract products consume. */
export declare function getShowcaseEnvironmentInput(environment: ShowcaseEnvironment): DesignSystemEnvironmentInput;
export type ShowcaseScenarioId = "contract" | "default" | "dark" | "long-copy" | "large-text" | "rtl" | "reduced-motion" | "accessibility" | "keyboard" | "native-actions" | "platform-parity";
export type ShowcaseSurface = "contract" | "web" | "native";
export type ShowcaseScenario = Readonly<{
    id: ShowcaseScenarioId;
    label: string;
    description: string;
}>;
export declare const showcaseScenarios: readonly [{
    readonly id: "contract";
    readonly label: "계약";
    readonly description: "구조·기본값·지원 축·플랫폼과 성숙도가 보인다.";
}, {
    readonly id: "default";
    readonly label: "기본";
    readonly description: "제품 설정을 덮어쓰지 않고 recipe 기본값으로 보통 상태를 그린다.";
}, {
    readonly id: "dark";
    readonly label: "어두운 테마";
    readonly description: "어두운 테마에서도 의미 색이 읽힌다.";
}, {
    readonly id: "long-copy";
    readonly label: "긴 문구";
    readonly description: "긴 한국어·영어 문구가 잘리거나 의미를 숨기지 않고 줄바꿈된다.";
}, {
    readonly id: "large-text";
    readonly label: "200% 글자";
    readonly description: "글자를 200%까지 키워도 필요한 정보가 잘리지 않는다.";
}, {
    readonly id: "rtl";
    readonly label: "오른쪽→왼쪽";
    readonly description: "논리적 시작·끝 배치와 방향 아이콘이 올바르게 뒤집힌다.";
}, {
    readonly id: "reduced-motion";
    readonly label: "동작 줄이기";
    readonly description: "움직임이 recipe의 동작 줄이기 대체 표현을 따른다.";
}, {
    readonly id: "accessibility";
    readonly label: "접근성";
    readonly description: "이름·상태·관계·대비·터치 영역을 확인할 수 있다.";
}, {
    readonly id: "keyboard";
    readonly label: "키보드";
    readonly description: "포커스 순서와 문서화한 키보드 동작을 상호작용 테스트로 실행한다.";
}, {
    readonly id: "native-actions";
    readonly label: "앱 동작";
    readonly description: "접근성 동작과 그 상태 변화를 Native renderer에서 실행한다.";
}, {
    readonly id: "platform-parity";
    readonly label: "웹·앱 동등성";
    readonly description: "각 renderer가 플랫폼 고유 동작을 쓰면서 같은 의도를 유지한다.";
}];
export type ShowcaseComponentEntry = Readonly<{
    storyId: string;
    component: ComponentCatalogEntry;
    /** Resolved Web/Native renderer maturity, including legacy catalog inputs. */
    surfaceMaturity: ComponentSurfaceMaturity;
    requirements: readonly ShowcaseEvidenceRequirement[];
    requiredScenarios: readonly ShowcaseScenarioId[];
    requiredSurfaces: readonly ShowcaseSurface[];
}>;
export type ShowcaseEvidenceRequirement = Readonly<{
    surface: ShowcaseSurface;
    scenarios: readonly ShowcaseScenarioId[];
}>;
export type ShowcaseEvidenceEntry = Readonly<{
    storyId: string;
    surface: ShowcaseSurface;
    scenarios: readonly ShowcaseScenarioId[];
}>;
export type ShowcaseCoverageEntry = Readonly<{
    storyId: string;
    component: ComponentCatalogEntry;
    missingEvidence: readonly Readonly<{
        surface: ShowcaseSurface;
        scenario: ShowcaseScenarioId;
    }>[];
    missingSurfaces: readonly ShowcaseSurface[];
    missingScenarios: readonly ShowcaseScenarioId[];
    complete: boolean;
}>;
export declare function getShowcaseStoryId(entry: ComponentCatalogEntry): string;
export declare function getRequiredShowcaseScenarios(entry: ComponentCatalogEntry): readonly ShowcaseScenarioId[];
export declare function getRequiredShowcaseSurfaces(entry: ComponentCatalogEntry): readonly ShowcaseSurface[];
export declare function getRequiredShowcaseEvidence(entry: ComponentCatalogEntry): readonly ShowcaseEvidenceRequirement[];
export declare function createShowcaseManifest(entries?: readonly ComponentCatalogEntry[]): readonly ShowcaseComponentEntry[];
export declare const showcaseManifest: readonly Readonly<{
    storyId: string;
    component: ComponentCatalogEntry;
    /** Resolved Web/Native renderer maturity, including legacy catalog inputs. */
    surfaceMaturity: ComponentSurfaceMaturity;
    requirements: readonly ShowcaseEvidenceRequirement[];
    requiredScenarios: readonly ShowcaseScenarioId[];
    requiredSurfaces: readonly ShowcaseSurface[];
}>[];
export declare function createShowcaseCoverage(evidence: readonly ShowcaseEvidenceEntry[], manifest?: readonly ShowcaseComponentEntry[]): readonly ShowcaseCoverageEntry[];
export declare function assertShowcaseCoverage(evidence: readonly ShowcaseEvidenceEntry[], manifest?: readonly ShowcaseComponentEntry[]): void;
export declare function summarizeShowcaseMaturity(entries?: readonly ComponentCatalogEntry[]): Readonly<Record<ComponentStatus, number>>;
//# sourceMappingURL=showcase.d.ts.map