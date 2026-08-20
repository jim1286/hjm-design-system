import type { BehaviorName } from "./behaviors.js";
export type ComponentCategory = "foundation" | "layout" | "action" | "input" | "navigation" | "data-display" | "feedback" | "overlay" | "provider" | "utility";
export type ComponentPlatform = "shared" | "adaptive" | "web" | "native";
export type ComponentStatus = "stable" | "beta" | "planned" | "deprecated";
export type ComponentRoadmapState = "contract-ready" | "composed" | "evidence-needed" | "prerequisite" | "declined";
export type ComponentRoadmap = Readonly<{
    state: ComponentRoadmapState;
    summary: string;
    /** Canonical components that solve this reference problem together. */
    targets?: readonly string[];
}>;
export type ComponentCatalogEntry = Readonly<{
    name: string;
    category: ComponentCategory;
    platform: ComponentPlatform;
    status: ComponentStatus;
    /** Search terms and familiar ecosystem names; never an API compatibility promise. */
    aliases?: readonly string[];
    recipe?: RecipeName;
    behavior?: BehaviorName;
    /** Why a planned row still exists and what event moves it forward. */
    roadmap?: ComponentRoadmap;
    /**
     * 만들지 않기로 **확정한** 항목의 사유. `status`는 구현 성숙도 축이고 이것은
     * "만들 것인가"라는 다른 질문이라 직교 필드로 둔다.
     *
     * 이 필드가 필요한 이유: crosswalk의 `targets`가 이 항목들을 가리키고
     * `targets.length > 0`이 테스트로 강제되므로, 흡수할 다른 이름이 없으면 행을 지울 수
     * 없다. 그렇다고 `planned`로 두면 "아직 안 만들었지만 만들 것"이라는 거짓을 말한다.
     * 근거는 `docs/<id>.md`에 있고, 그 문서의 존재를 테스트가 강제한다.
     */
    declinedReason?: string;
}>;
/**
 * The catalog is a scope and maturity contract, not an implementation claim.
 * `shared` means API/visual parity. `adaptive` means shared intent with native
 * platform behavior. Web/native entries are intentionally platform-specific.
 */
export declare const componentCatalog: readonly [{
    readonly name: "Text";
    readonly category: "foundation";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "textRecipe";
}, {
    readonly name: "Icon";
    readonly category: "foundation";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "iconRecipe";
}, {
    readonly name: "Surface";
    readonly category: "layout";
    readonly platform: "shared";
    readonly status: "stable";
    readonly recipe: "surfaceRecipe";
}, {
    readonly name: "Divider";
    readonly category: "layout";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "dividerRecipe";
}, {
    readonly name: "Section";
    readonly category: "layout";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "sectionRecipe";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Stack";
    readonly category: "layout";
    readonly platform: "shared";
    readonly status: "planned";
    readonly recipe: "stackRecipe";
    readonly aliases: readonly ["Flex", "Space", "Inline"];
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly name: "Grid";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "planned";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Layout";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "planned";
    readonly aliases: readonly ["AppShell"];
    readonly recipe: "layoutRecipe";
    readonly behavior: "layout";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly name: "Masonry";
    readonly category: "layout";
    readonly platform: "adaptive";
    readonly status: "planned";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Splitter";
    readonly category: "layout";
    readonly platform: "web";
    readonly status: "planned";
    readonly aliases: readonly ["SplitPane"];
    readonly recipe: "splitterRecipe";
    readonly behavior: "splitter";
}, {
    readonly name: "Button";
    readonly category: "action";
    readonly platform: "shared";
    readonly status: "stable";
    readonly recipe: "buttonRecipe";
}, {
    readonly name: "IconButton";
    readonly category: "action";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "iconButtonRecipe";
}, {
    readonly name: "Link";
    readonly category: "action";
    readonly platform: "adaptive";
    readonly status: "beta";
    readonly recipe: "linkRecipe";
    readonly behavior: "link";
}, {
    readonly name: "BottomCTA";
    readonly category: "action";
    readonly platform: "native";
    readonly status: "beta";
    readonly recipe: "bottomCtaRecipe";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "FloatingActionButton";
    readonly category: "action";
    readonly platform: "adaptive";
    readonly status: "planned";
    readonly recipe: "floatingActionButtonRecipe";
    readonly behavior: "floatingActionButton";
    readonly aliases: readonly ["FloatButton", "FAB"];
}, {
    readonly name: "Field";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "stable";
    readonly recipe: "fieldRecipe";
    readonly behavior: "field";
}, {
    readonly name: "SearchField";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "searchFieldRecipe";
    readonly behavior: "searchField";
}, {
    readonly name: "TextArea";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "stable";
    readonly recipe: "fieldRecipe";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "PasswordField";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "planned";
    readonly aliases: readonly ["Input.Password"];
    readonly recipe: "passwordFieldRecipe";
    readonly behavior: "passwordField";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "OtpField";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "planned";
    readonly aliases: readonly ["Input.OTP"];
    readonly recipe: "otpFieldRecipe";
    readonly behavior: "otpField";
}, {
    readonly name: "Checkbox";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "selectionControlRecipe";
    readonly behavior: "checkbox";
}, {
    readonly name: "Radio";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "selectionControlRecipe";
}, {
    readonly name: "CheckboxGroup";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "selectionGroupRecipe";
    readonly behavior: "checkboxGroup";
}, {
    readonly name: "RadioGroup";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "selectionGroupRecipe";
    readonly behavior: "radioGroup";
}, {
    readonly name: "Switch";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "switchRecipe";
    readonly behavior: "switch";
}, {
    readonly name: "Chip";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "chipRecipe";
    readonly behavior: "chip";
}, {
    readonly name: "SegmentedControl";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "segmentedControlRecipe";
    readonly behavior: "segmentedControl";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Slider";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "planned";
    readonly recipe: "sliderRecipe";
    readonly behavior: "slider";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "NumberField";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "planned";
    readonly recipe: "numberFieldRecipe";
    readonly behavior: "numberField";
}, {
    readonly name: "Select";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "beta";
    readonly recipe: "selectRecipe";
    readonly behavior: "select";
}, {
    readonly name: "Combobox";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "beta";
    readonly recipe: "comboboxRecipe";
    readonly behavior: "combobox";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "DatePicker";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "planned";
    readonly recipe: "datePickerRecipe";
    readonly behavior: "datePicker";
}, {
    readonly roadmap: {
        readonly state: "composed";
        readonly summary: string;
        readonly targets: readonly string[];
    };
    readonly name: "TimePicker";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "planned";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly name: "ColorPicker";
    readonly category: "input";
    readonly platform: "web";
    readonly status: "planned";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "FilePicker";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "planned";
    readonly recipe: "filePickerRecipe";
    readonly behavior: "filePicker";
    readonly aliases: readonly ["Upload"];
}, {
    readonly roadmap: {
        readonly state: "prerequisite";
        readonly summary: string;
        readonly targets: readonly string[];
    };
    readonly name: "Cascader";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "planned";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Form";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "planned";
    readonly recipe: "formRecipe";
    readonly behavior: "form";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Mentions";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "planned";
    readonly recipe: "comboboxRecipe";
    readonly behavior: "combobox";
}, {
    readonly roadmap: {
        readonly state: "composed";
        readonly summary: string;
        readonly targets: readonly string[];
    };
    readonly name: "Rating";
    readonly category: "input";
    readonly platform: "shared";
    readonly status: "planned";
    readonly aliases: readonly ["Rate"];
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "TransferList";
    readonly category: "input";
    readonly platform: "adaptive";
    readonly status: "planned";
    readonly aliases: readonly ["Transfer"];
    readonly recipe: "transferListRecipe";
    readonly behavior: "transferList";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "TreeSelect";
    readonly category: "input";
    readonly platform: "web";
    readonly status: "planned";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "UploadItem";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "planned";
    readonly recipe: "uploadItemRecipe";
    readonly behavior: "uploadItem";
}, {
    readonly name: "Tabs";
    readonly category: "navigation";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "tabsRecipe";
    readonly behavior: "tabs";
}, {
    readonly name: "TopBar";
    readonly category: "navigation";
    readonly platform: "native";
    readonly status: "beta";
    readonly recipe: "topBarRecipe";
}, {
    readonly name: "BottomNavigation";
    readonly category: "navigation";
    readonly platform: "adaptive";
    readonly status: "beta";
    readonly recipe: "bottomNavigationRecipe";
    readonly behavior: "bottomNavigation";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Breadcrumb";
    readonly category: "navigation";
    readonly platform: "web";
    readonly status: "planned";
    readonly recipe: "breadcrumbRecipe";
    readonly behavior: "breadcrumb";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Pagination";
    readonly category: "navigation";
    readonly platform: "web";
    readonly status: "planned";
    readonly recipe: "paginationRecipe";
    readonly behavior: "pagination";
}, {
    readonly name: "LoadMore";
    readonly category: "navigation";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "loadMoreRecipe";
    readonly behavior: "loadMore";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Steps";
    readonly category: "navigation";
    readonly platform: "shared";
    readonly status: "planned";
    readonly recipe: "stepsRecipe";
}, {
    readonly name: "Menu";
    readonly category: "navigation";
    readonly platform: "adaptive";
    readonly status: "beta";
    readonly recipe: "menuRecipe";
    readonly behavior: "menu";
    readonly aliases: readonly ["Dropdown"];
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly name: "Anchor";
    readonly category: "navigation";
    readonly platform: "web";
    readonly status: "planned";
}, {
    readonly name: "Avatar";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "avatarRecipe";
}, {
    readonly name: "Badge";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "badgeRecipe";
}, {
    readonly name: "CounterBadge";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "counterBadgeRecipe";
}, {
    readonly name: "Card";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "surfaceRecipe";
}, {
    readonly name: "List";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "listRecipe";
}, {
    readonly name: "ListRow";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "listRowRecipe";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly name: "VirtualList";
    readonly category: "data-display";
    readonly platform: "adaptive";
    readonly status: "planned";
    readonly aliases: readonly ["Listy"];
}, {
    readonly name: "Accordion";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "accordionRecipe";
    readonly behavior: "disclosureGroup";
}, {
    readonly name: "Statistic";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "statisticRecipe";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Timeline";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "planned";
    readonly recipe: "timelineRecipe";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "DataTable";
    readonly category: "data-display";
    readonly platform: "web";
    readonly status: "planned";
    readonly recipe: "dataTableRecipe";
    readonly behavior: "dataTable";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Tree";
    readonly category: "data-display";
    readonly platform: "web";
    readonly status: "planned";
    readonly recipe: "treeRecipe";
    readonly behavior: "tree";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Calendar";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "planned";
    readonly recipe: "calendarRecipe";
    readonly behavior: "calendar";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Carousel";
    readonly category: "data-display";
    readonly platform: "adaptive";
    readonly status: "planned";
    readonly recipe: "carouselRecipe";
    readonly behavior: "carousel";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "DescriptionList";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "planned";
    readonly recipe: "descriptionListRecipe";
    readonly aliases: readonly ["Descriptions"];
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Image";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "planned";
    readonly recipe: "imageRecipe";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly name: "QRCode";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "planned";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Tag";
    readonly category: "data-display";
    readonly platform: "shared";
    readonly status: "planned";
    readonly recipe: "tagRecipe";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Tour";
    readonly category: "overlay";
    readonly platform: "web";
    readonly status: "planned";
    readonly recipe: "tourRecipe";
    readonly behavior: "tour";
    readonly aliases: readonly ["CoachMark"];
}, {
    readonly name: "EmptyState";
    readonly category: "feedback";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "emptyStateRecipe";
}, {
    readonly name: "Notice";
    readonly category: "feedback";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "noticeRecipe";
}, {
    readonly name: "Progress";
    readonly category: "feedback";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "progressRecipe";
}, {
    readonly name: "Spinner";
    readonly category: "feedback";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "spinnerRecipe";
}, {
    readonly name: "Skeleton";
    readonly category: "feedback";
    readonly platform: "shared";
    readonly status: "beta";
    readonly recipe: "skeletonRecipe";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Result";
    readonly category: "feedback";
    readonly platform: "shared";
    readonly status: "planned";
    readonly recipe: "resultRecipe";
}, {
    readonly name: "Toast";
    readonly category: "feedback";
    readonly platform: "adaptive";
    readonly status: "beta";
    readonly recipe: "toastRecipe";
    readonly behavior: "toast";
    readonly aliases: readonly ["Notification"];
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly name: "Watermark";
    readonly category: "feedback";
    readonly platform: "web";
    readonly status: "planned";
}, {
    readonly name: "Dialog";
    readonly category: "overlay";
    readonly platform: "adaptive";
    readonly status: "beta";
    readonly recipe: "dialogRecipe";
    readonly behavior: "dialog";
}, {
    readonly name: "AlertDialog";
    readonly category: "overlay";
    readonly platform: "adaptive";
    readonly status: "beta";
    readonly recipe: "alertDialogRecipe";
    readonly behavior: "alertDialog";
}, {
    readonly name: "Sheet";
    readonly category: "overlay";
    readonly platform: "adaptive";
    readonly status: "beta";
    readonly recipe: "sheetRecipe";
    readonly behavior: "sheet";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "SidePanel";
    readonly category: "overlay";
    readonly platform: "web";
    readonly status: "planned";
    readonly recipe: "sidePanelRecipe";
    readonly behavior: "sidePanel";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "Popover";
    readonly category: "overlay";
    readonly platform: "web";
    readonly status: "planned";
    readonly recipe: "popoverRecipe";
    readonly behavior: "popover";
}, {
    readonly roadmap: {
        readonly state: "composed";
        readonly summary: string;
        readonly targets: readonly string[];
    };
    readonly name: "ConfirmPopover";
    readonly category: "overlay";
    readonly platform: "web";
    readonly status: "planned";
    readonly aliases: readonly ["Popconfirm"];
}, {
    readonly name: "Tooltip";
    readonly category: "overlay";
    readonly platform: "web";
    readonly status: "beta";
    readonly recipe: "tooltipRecipe";
    readonly behavior: "tooltip";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "CommandPalette";
    readonly category: "overlay";
    readonly platform: "web";
    readonly status: "planned";
    readonly recipe: "commandPaletteRecipe";
    readonly behavior: "commandPalette";
}, {
    readonly roadmap: {
        readonly state: "evidence-needed";
        readonly summary: string;
    };
    readonly name: "Affix";
    readonly category: "utility";
    readonly platform: "web";
    readonly status: "planned";
}, {
    readonly declinedReason: string;
    readonly roadmap: {
        readonly state: "declined";
        readonly summary: string;
    };
    readonly name: "AppProvider";
    readonly category: "provider";
    readonly platform: "adaptive";
    readonly status: "planned";
    readonly aliases: readonly ["App"];
}, {
    readonly declinedReason: string;
    readonly roadmap: {
        readonly state: "declined";
        readonly summary: string;
    };
    readonly name: "BorderBeam";
    readonly category: "utility";
    readonly platform: "web";
    readonly status: "planned";
}, {
    readonly roadmap: {
        readonly state: "contract-ready";
        readonly summary: string;
    };
    readonly name: "DesignSystemProvider";
    readonly category: "provider";
    readonly platform: "shared";
    readonly status: "planned";
    readonly aliases: readonly ["ConfigProvider"];
}, {
    readonly declinedReason: string;
    readonly roadmap: {
        readonly state: "declined";
        readonly summary: string;
    };
    readonly name: "Utility";
    readonly category: "utility";
    readonly platform: "web";
    readonly status: "planned";
    readonly aliases: readonly ["Util"];
}];
export type ComponentName = (typeof componentCatalog)[number]["name"];
export declare function summarizeComponentRoadmap(entries?: readonly ComponentCatalogEntry[]): Readonly<Record<ComponentRoadmapState, number>>;
/** One typed registry prevents catalog recipe names from drifting into strings. */
export declare const recipeRegistry: {
    readonly accordionRecipe: {
        readonly slots: readonly ["root", "item", "header", "trigger", "title", "indicator", "panel", "divider"];
        readonly defaults: {
            readonly density: "comfortable";
            readonly allowsMultipleExpanded: false;
        };
        readonly density: {
            readonly compact: {
                readonly triggerMinHeight: 44;
                readonly paddingVertical: 8;
            };
            readonly comfortable: {
                readonly triggerMinHeight: 56;
                readonly paddingVertical: 12;
            };
        };
        readonly paddingHorizontal: 8;
        readonly gap: 12;
        readonly title: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "bodyLarge";
            readonly fontWeight: "700";
        };
        readonly indicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly panel: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly paddingBottom: 16;
            readonly paddingInlineStart: 8;
        };
        readonly divider: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly states: {
            readonly pressedBackground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly disabledOpacity: 0.5;
        };
        readonly transition: {
            readonly duration: 200;
            readonly easing: "enter";
            readonly reducedMotion: "opacity";
        };
    };
    readonly alertDialogRecipe: {
        readonly slots: readonly ["backdrop", "positioner", "content", "icon", "title", "description", "status", "error", "actions", "cancel", "confirm"];
        readonly defaults: {
            readonly tone: "attention";
            readonly size: "small";
        };
        readonly sizes: {
            readonly small: {
                readonly maxWidth: 320;
                readonly padding: 20;
            };
            readonly medium: {
                readonly maxWidth: 420;
                readonly padding: 24;
            };
            readonly large: {
                readonly maxWidth: 640;
                readonly padding: 24;
            };
        };
        readonly backdrop: {
            readonly color: "#000000";
            readonly opacity: 0.6;
        };
        readonly content: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "lg";
            readonly gap: 16;
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
        };
        readonly tones: {
            readonly attention: {
                readonly icon: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly iconBackground: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly confirm: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly confirmContent: Readonly<{
                    source: "theme";
                    key: "onPrimary";
                    alpha?: number;
                }>;
            };
            readonly danger: {
                readonly icon: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly iconBackground: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly confirm: Readonly<{
                    source: "theme";
                    key: "dangerFill";
                    alpha?: number;
                }>;
                readonly confirmContent: Readonly<{
                    source: "theme";
                    key: "onDanger";
                    alpha?: number;
                }>;
            };
        };
        readonly icon: {
            readonly containerSize: 44;
            readonly glyph: "md";
            readonly radius: "full";
        };
        readonly title: {
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly textVariant: "title";
            readonly fontWeight: "700";
        };
        readonly description: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly error: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly actions: {
            readonly gap: 12;
            readonly stackBelow: 600;
            readonly minButtonWidth: 96;
        };
        readonly transition: {
            readonly enter: {
                readonly duration: 200;
                readonly easing: "enter";
                readonly reducedMotion: "opacity";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
    };
    readonly avatarRecipe: {
        readonly slots: readonly ["root", "image", "fallback", "badge"];
        readonly defaults: {
            readonly size: "medium";
            readonly shape: "circle";
        };
        readonly sizes: {
            readonly small: 32;
            readonly medium: 40;
            readonly large: 48;
            readonly xlarge: 64;
        };
        readonly shapes: {
            readonly rounded: "md";
            readonly circle: "full";
        };
        readonly background: Readonly<{
            source: "theme";
            key: "surfaceAlt";
            alpha?: number;
        }>;
        readonly content: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
    };
    readonly badgeRecipe: {
        readonly slots: readonly ["root", "icon", "label"];
        readonly defaults: {
            readonly tone: "neutral";
            readonly size: "medium";
        };
        readonly tones: {
            readonly neutral: {
                readonly content: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "theme";
                    key: "surfaceAlt";
                    alpha?: number;
                }>;
                readonly border: null;
            };
            readonly strong: {
                readonly content: Readonly<{
                    source: "theme";
                    key: "onPrimary";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly border: null;
            };
            readonly brand: {
                readonly content: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "theme";
                    key: "surfaceAlt";
                    alpha?: number;
                }>;
                readonly border: null;
            };
            readonly info: {
                readonly content: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
            };
            readonly success: {
                readonly content: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
            };
            readonly warning: {
                readonly content: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
            };
            readonly attention: {
                readonly content: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
            };
            readonly danger: {
                readonly content: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
        };
        readonly sizes: {
            readonly small: {
                readonly minHeight: 20;
                readonly paddingHorizontal: 4;
                readonly gap: 4;
                readonly textVariant: "caption";
            };
            readonly medium: {
                readonly minHeight: 24;
                readonly paddingHorizontal: 8;
                readonly gap: 4;
                readonly textVariant: "caption";
            };
        };
        readonly radius: "full";
        readonly borderWidth: 1;
        readonly fontWeight: "700";
    };
    readonly bottomNavigationRecipe: {
        readonly slots: readonly ["root", "surface", "list", "item", "indicator", "icon", "label", "badge"];
        readonly defaults: {
            readonly presentation: "bar";
            readonly distribution: "equal";
            readonly density: "regular";
        };
        readonly adaptive: {
            readonly web: "fixed-compact-viewport";
            readonly native: "navigator-tab-bar";
        };
        readonly presentations: {
            readonly bar: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
                readonly borderWidth: 1;
                readonly borderEdges: readonly ["block-start"];
                readonly radius: null;
                readonly shadow: null;
                readonly maxWidth: null;
                readonly outerPaddingHorizontal: 0;
                readonly outerPaddingTop: 0;
            };
            readonly floating: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
                readonly borderWidth: 1;
                readonly borderEdges: readonly ["all"];
                readonly radius: "xl";
                readonly shadow: {
                    readonly color: "#000000";
                    readonly opacity: 0.12;
                    readonly radius: 12;
                    readonly offsetY: 4;
                };
                readonly maxWidth: 384;
                readonly outerPaddingHorizontal: 16;
                readonly outerPaddingTop: 8;
            };
        };
        readonly distributions: {
            readonly equal: {
                readonly centerGap: 0;
                readonly requiresEvenItemCount: false;
            };
            readonly "center-gap": {
                readonly centerGap: number;
                readonly requiresEvenItemCount: true;
            };
        };
        readonly density: {
            readonly compact: {
                readonly itemMinWidth: 52;
                readonly itemMinHeight: 52;
                readonly padding: 4;
                readonly gap: 2;
                readonly icon: "sm";
                readonly label: "caption";
            };
            readonly regular: {
                readonly itemMinWidth: 56;
                readonly itemMinHeight: 64;
                readonly padding: 8;
                readonly gap: 4;
                readonly icon: "md";
                readonly label: "caption";
            };
        };
        readonly colors: {
            readonly idle: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly selectedIcon: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly selectedLabel: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly selectedIndicator: Readonly<{
                source: "theme";
                key: "surfaceAccent";
                alpha?: number;
            }>;
        };
        readonly indicator: {
            readonly minWidth: 40;
            readonly minHeight: 28;
            readonly radius: "full";
            readonly border: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly borderWidth: 2;
        };
        readonly label: {
            readonly fontWeight: "600";
            readonly selectedFontWeight: "700";
            readonly textAlign: "center";
            readonly wrap: true;
            readonly fixedLines: null;
        };
        readonly badge: {
            readonly size: "small";
            readonly variant: "floating";
            readonly anchor: {
                readonly blockStart: number;
                readonly inlineEnd: number;
            };
            readonly subtreeHiddenFromAccessibility: true;
        };
        readonly safeArea: {
            readonly mode: "additive";
            readonly minimumBottomPadding: 8;
        };
        readonly keyboard: {
            readonly defaultBehavior: "hide";
            readonly movesAboveKeyboard: false;
        };
        readonly largeText: {
            readonly allowFontScaling: true;
            readonly fixedItemHeight: false;
            readonly labelWraps: true;
        };
        readonly direction: {
            readonly itemOrder: "logical";
            readonly badgeAnchor: "inline-end";
        };
        readonly states: {
            readonly hoverBackground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly pressedBackground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly disabledOpacity: 0.5;
            readonly selectedUsesNonColorIndicator: true;
            readonly selectedFocusSeparation: {
                readonly selectedTarget: "indicator";
                readonly focusTarget: "item";
                readonly minimumGap: 2;
            };
        };
        readonly transition: {
            readonly duration: 120;
            readonly easing: "standard";
            readonly reducedMotion: "instant";
        };
    };
    readonly bottomCtaRecipe: {
        readonly slots: readonly ["root", "description", "secondaryAction", "primaryAction"];
        readonly minHeight: 64;
        readonly paddingHorizontal: 20;
        readonly paddingTop: 12;
        readonly paddingBottom: 12;
        readonly gap: 12;
        readonly background: Readonly<{
            source: "theme";
            key: "surface";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly borderWidth: 1;
        readonly shadow: {
            readonly color: "#000000";
            readonly opacity: 0.08;
            readonly radius: 8;
            readonly offsetY: -2;
            readonly elevation: 8;
        };
    };
    readonly breadcrumbRecipe: {
        readonly slots: readonly ["root", "list", "item", "link", "current", "separator"];
        readonly gap: 4;
        readonly link: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
        readonly current: {
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly fontWeight: "600";
        };
        readonly separator: {
            readonly color: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
            readonly glyph: "xs";
            readonly icon: "chevronEnd";
            readonly decorative: true;
        };
    };
    readonly calendarRecipe: {
        readonly slots: readonly ["root", "header", "monthLabel", "previousMonth", "nextMonth", "weekdayRow", "weekdayLabel", "grid", "week", "day", "dayLabel", "content"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly header: {
            readonly gap: 8;
            readonly monthLabel: {
                readonly textVariant: "title";
                readonly fontWeight: "700";
                readonly color: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
            };
            readonly navButton: {
                readonly diameter: 44;
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
            };
            readonly navIcon: {
                readonly previous: "chevronStart";
                readonly next: "chevronEnd";
            };
        };
        readonly weekdayLabel: {
            readonly textVariant: "label";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly sizes: {
            readonly medium: {
                readonly cellDiameter: 44;
                readonly textVariant: "body";
                readonly glyph: "sm";
            };
            readonly large: {
                readonly cellDiameter: 44;
                readonly textVariant: "bodyLarge";
                readonly glyph: "md";
            };
        };
        readonly day: {
            readonly radius: "full";
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly numericVariant: "tabular";
            };
            readonly outsideFocusedMonthOpacity: 0.72;
            readonly disabledOpacity: 0.5;
            readonly today: {
                readonly border: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly borderWidth: 1;
            };
            readonly selected: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "onPrimary";
                    alpha?: number;
                }>;
            };
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly buttonRecipe: {
        readonly slots: readonly ["root", "leading", "label", "trailing", "spinner"];
        readonly defaults: {
            readonly tone: "primary";
            readonly size: "medium";
        };
        readonly tones: {
            readonly primary: {
                readonly background: "primary";
                readonly content: "onPrimary";
                readonly border: null;
            };
            readonly secondary: {
                readonly background: "surfaceAlt";
                readonly content: "text";
                readonly border: "border";
            };
            readonly ghost: {
                readonly background: null;
                readonly content: "textMuted";
                readonly border: null;
            };
            readonly danger: {
                readonly background: "dangerFill";
                readonly content: "onDanger";
                readonly border: null;
            };
            readonly link: {
                readonly background: null;
                readonly content: "contentBrand";
                readonly border: null;
            };
        };
        readonly sizes: {
            readonly small: {
                readonly height: 36;
                readonly hitSlop: 4;
                readonly paddingHorizontal: 12;
                readonly textVariant: "label";
            };
            readonly medium: {
                readonly height: 44;
                readonly hitSlop: 0;
                readonly paddingHorizontal: 16;
                readonly textVariant: "body";
            };
            readonly large: {
                readonly height: 52;
                readonly hitSlop: 0;
                readonly paddingHorizontal: 20;
                readonly textVariant: "bodyLarge";
            };
        };
        readonly opacity: {
            readonly disabled: 0.5;
            readonly pressed: 0.86;
        };
    };
    readonly carouselRecipe: {
        readonly slots: readonly ["root", "track", "slide", "dots", "dot", "previousControl", "nextControl"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly sizes: {
            readonly medium: {
                readonly gap: 12;
                readonly controlHitTarget: 44;
                readonly controlIcon: "sm";
            };
        };
        readonly dot: {
            readonly diameter: 8;
            readonly hitTarget: 44;
            readonly color: {
                readonly inactive: Readonly<{
                    source: "theme";
                    key: "textWeak";
                    alpha?: number;
                }>;
                readonly current: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
            };
        };
        readonly control: {
            readonly icons: {
                readonly previous: "chevronStart";
                readonly next: "chevronEnd";
            };
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly draggedOpacity: 0.64;
        };
        readonly transition: {
            readonly duration: 320;
            readonly easing: "emphasized";
            readonly reducedMotion: "opacity";
        };
    };
    readonly chipRecipe: {
        readonly slots: readonly ["root", "leading", "indicator", "label", "trailing"];
        readonly defaults: {
            readonly size: "small";
            readonly selected: false;
        };
        readonly sizes: {
            readonly small: {
                readonly height: 36;
                readonly hitSlop: 4;
                readonly paddingHorizontal: 12;
                readonly gap: 4;
                readonly textVariant: "body";
            };
            readonly medium: {
                readonly height: 44;
                readonly hitSlop: 0;
                readonly paddingHorizontal: 16;
                readonly gap: 8;
                readonly textVariant: "body";
            };
        };
        readonly states: {
            readonly idle: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "surface";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
            };
            readonly selected: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "surfaceAccent";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
            };
            readonly pressedOpacity: 0.86;
            readonly disabledOpacity: 0.5;
        };
        readonly radius: "full";
        readonly borderWidth: 1;
        readonly label: {
            readonly fontWeight: "600";
            readonly selectedFontWeight: "700";
        };
        readonly selectionIndicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly glyph: "xs";
        };
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
    };
    readonly comboboxRecipe: {
        readonly slots: readonly ["root", "label", "field", "leading", "input", "indicator", "clear", "loadingIndicator", "description", "error", "popover", "viewport", "section", "sectionLabel", "option", "optionLeading", "optionCopy", "optionLabel", "optionDescription", "selectionIndicator", "stateMessage"];
        readonly defaults: {
            readonly size: "medium";
            readonly density: "comfortable";
        };
        readonly adaptive: {
            readonly web: "popover";
            readonly native: "sheet";
        };
        readonly frame: {
            readonly background: Readonly<{
                source: "theme";
                key: "surface";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly focusBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly radius: "md";
            readonly borderWidth: 1;
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
        };
        readonly sizes: {
            readonly medium: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 16;
                readonly textVariant: "body";
                readonly glyph: "sm";
            };
            readonly large: {
                readonly minHeight: 52;
                readonly paddingHorizontal: 20;
                readonly textVariant: "bodyLarge";
                readonly glyph: "md";
            };
        };
        readonly support: {
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
                readonly fontWeight: "600";
            };
            readonly hint: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly error: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly gap: 8;
        };
        readonly input: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly placeholderColor: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly gap: 12;
        };
        readonly leading: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly indicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly clear: {
            readonly diameter: 36;
            readonly hitSlop: 4;
            readonly glyph: "xs";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly loadingIndicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly popover: {
            readonly minWidth: 220;
            readonly maxWidth: 420;
            readonly maxHeight: 360;
            readonly sideOffset: 8;
            readonly collisionPadding: 8;
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "md";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly padding: 8;
        };
        readonly density: {
            readonly compact: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 12;
                readonly gap: 12;
                readonly radius: "md";
                readonly label: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textBody";
                        alpha?: number;
                    }>;
                    readonly textVariant: "body";
                };
                readonly description: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textMuted";
                        alpha?: number;
                    }>;
                    readonly textVariant: "label";
                };
                readonly highlightedBackground: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly focus: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "contentBrand";
                        alpha?: number;
                    }>;
                    readonly width: 2;
                    readonly offset: 2;
                };
                readonly selectedBackground: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly selectedIndicator: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly danger: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
            readonly comfortable: {
                readonly minHeight: 56;
                readonly paddingHorizontal: 12;
                readonly gap: 12;
                readonly radius: "md";
                readonly label: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textBody";
                        alpha?: number;
                    }>;
                    readonly textVariant: "body";
                };
                readonly description: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textMuted";
                        alpha?: number;
                    }>;
                    readonly textVariant: "label";
                };
                readonly highlightedBackground: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly focus: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "contentBrand";
                        alpha?: number;
                    }>;
                    readonly width: 2;
                    readonly offset: 2;
                };
                readonly selectedBackground: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly selectedIndicator: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly danger: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
        };
        readonly sectionLabel: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly paddingHorizontal: 12;
            readonly paddingVertical: 8;
        };
        readonly optionLeading: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly optionLabel: {
            readonly fontWeight: "600";
            readonly selectedFontWeight: "700";
        };
        readonly selectionIndicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly stateMessage: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly paddingVertical: 12;
        };
        readonly states: {
            readonly hoverBackground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly pressedBackground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly disabledOpacity: 0.5;
        };
        readonly transition: {
            readonly web: {
                readonly enter: {
                    readonly duration: 120;
                    readonly easing: "standard";
                    readonly reducedMotion: "instant";
                };
                readonly exit: {
                    readonly duration: 120;
                    readonly easing: "exit";
                    readonly reducedMotion: "instant";
                };
            };
            readonly native: {
                readonly enter: {
                    readonly duration: 200;
                    readonly easing: "enter";
                    readonly reducedMotion: "opacity";
                };
                readonly exit: {
                    readonly duration: 120;
                    readonly easing: "exit";
                    readonly reducedMotion: "instant";
                };
            };
        };
    };
    readonly descriptionListRecipe: {
        readonly slots: readonly ["root", "group", "item", "label", "value"];
        readonly defaults: {
            readonly columns: 2;
        };
        readonly group: {
            readonly gap: 12;
            readonly minItemWidth: 160;
            readonly columns: readonly [1, 2];
        };
        readonly item: {
            readonly gap: 4;
        };
        readonly label: {
            readonly textVariant: "label";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly value: {
            readonly textVariant: "body";
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly maxLines: null;
        };
    };
    readonly counterBadgeRecipe: {
        readonly slots: readonly ["root", "label"];
        readonly defaults: {
            readonly tone: "danger";
            readonly size: "medium";
            readonly variant: "inline";
            readonly max: 99;
        };
        readonly tones: {
            readonly danger: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "dangerFill";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "onDanger";
                    alpha?: number;
                }>;
            };
            readonly brand: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "onPrimary";
                    alpha?: number;
                }>;
            };
            readonly neutral: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
            };
        };
        readonly sizes: {
            readonly small: {
                readonly height: 16;
                readonly minWidth: 16;
                readonly paddingHorizontal: 4;
                readonly textVariant: "caption";
            };
            readonly medium: {
                readonly height: 20;
                readonly minWidth: 20;
                readonly paddingHorizontal: 8;
                readonly textVariant: "caption";
            };
        };
        readonly variants: {
            readonly inline: {
                readonly border: null;
                readonly borderWidth: 0;
            };
            readonly floating: {
                readonly border: Readonly<{
                    source: "theme";
                    key: "bg";
                    alpha?: number;
                }>;
                readonly borderWidth: 2;
            };
        };
        readonly radius: "full";
        readonly fontWeight: "700";
    };
    readonly dialogRecipe: {
        readonly slots: readonly ["backdrop", "positioner", "content", "header", "title", "description", "body", "footer", "close"];
        readonly defaults: {
            readonly size: "medium";
            readonly dismissible: true;
        };
        readonly sizes: {
            readonly small: {
                readonly maxWidth: 320;
                readonly padding: 20;
            };
            readonly medium: {
                readonly maxWidth: 420;
                readonly padding: 24;
            };
            readonly large: {
                readonly maxWidth: 640;
                readonly padding: 24;
            };
        };
        readonly backdrop: {
            readonly color: "#000000";
            readonly opacity: 0.6;
        };
        readonly content: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "lg";
            readonly gap: 16;
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
        };
        readonly transition: {
            readonly enter: {
                readonly duration: 200;
                readonly easing: "enter";
                readonly reducedMotion: "opacity";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
    };
    readonly dataTableRecipe: {
        readonly slots: readonly ["root", "header", "headerCell", "sortButton", "sortIcon", "row", "cell", "selectionCell", "emptyState", "errorState"];
        readonly defaults: {
            readonly density: "regular";
        };
        readonly density: {
            readonly compact: {
                readonly paddingVertical: 8;
                readonly paddingHorizontal: 12;
            };
            readonly regular: {
                readonly paddingVertical: 12;
                readonly paddingHorizontal: 16;
            };
        };
        readonly header: {
            readonly background: Readonly<{
                source: "theme";
                key: "surfaceAlt";
                alpha?: number;
            }>;
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly fontWeight: "700";
            readonly borderBottom: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
        };
        readonly row: {
            readonly borderBottom: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly hoverBackground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
        };
        readonly cell: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly sortButton: {
            readonly minTarget: 44;
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly activeColor: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
        };
        readonly selectionCell: {
            readonly width: 44;
        };
        readonly emptyState: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly errorState: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly datePickerRecipe: {
        readonly slots: readonly ["root", "label", "trigger", "leading", "value", "placeholder", "clear", "indicator", "description", "error", "popover"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly adaptive: {
            readonly web: "popover";
            readonly native: "sheet";
        };
        readonly frame: {
            readonly background: Readonly<{
                source: "theme";
                key: "surface";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly focusBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly radius: "md";
            readonly borderWidth: 1;
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
        };
        readonly sizes: {
            readonly medium: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 16;
                readonly textVariant: "body";
                readonly glyph: "sm";
            };
            readonly large: {
                readonly minHeight: 52;
                readonly paddingHorizontal: 20;
                readonly textVariant: "bodyLarge";
                readonly glyph: "md";
            };
        };
        readonly support: {
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
                readonly fontWeight: "600";
            };
            readonly hint: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly error: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly gap: 8;
        };
        readonly value: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly placeholderColor: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly leading: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly icon: "calendar";
        };
        readonly indicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly clear: {
            readonly diameter: 36;
            readonly hitSlop: 4;
            readonly glyph: "xs";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly popover: {
            readonly minWidth: 300;
            readonly maxWidth: 360;
            readonly sideOffset: 8;
            readonly collisionPadding: 8;
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "md";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly padding: 8;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
    };
    readonly dividerRecipe: {
        readonly slots: readonly ["root", "label"];
        readonly defaults: {
            readonly orientation: "horizontal";
            readonly inset: "none";
        };
        readonly color: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly thickness: 1;
        readonly insets: {
            readonly none: 0;
            readonly start: 16;
            readonly both: 16;
        };
    };
    readonly formRecipe: {
        readonly slots: readonly ["root", "field", "formError", "actions"];
        readonly defaults: {
            readonly density: "comfortable";
        };
        readonly density: {
            readonly compact: {
                readonly fieldGap: 12;
            };
            readonly comfortable: {
                readonly fieldGap: 20;
            };
        };
        readonly formError: {
            readonly position: "beforeActions";
            readonly gap: 12;
        };
    };
    readonly emptyStateRecipe: {
        readonly slots: readonly ["root", "icon", "title", "description", "action"];
        readonly defaults: {
            readonly density: "regular";
        };
        readonly density: {
            readonly compact: {
                readonly paddingVertical: 24;
            };
            readonly regular: {
                readonly paddingVertical: 40;
            };
        };
        readonly paddingHorizontal: 24;
        readonly gap: 8;
        readonly icon: {
            readonly size: "lg";
            readonly color: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
        };
        readonly title: {
            readonly textVariant: "body";
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly fontWeight: "600";
        };
        readonly description: {
            readonly textVariant: "label";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
    };
    readonly fieldRecipe: {
        readonly slots: readonly ["root", "label", "control", "leading", "input", "trailing", "hint", "error"];
        readonly defaults: {
            readonly variant: "surface";
            readonly shape: "medium";
        };
        readonly variants: {
            readonly surface: {
                readonly background: "surface";
            };
            readonly inset: {
                readonly background: "bg";
            };
        };
        readonly shapes: {
            readonly medium: "md";
            readonly large: "lg";
            readonly full: "full";
        };
        readonly states: {
            readonly idle: {
                readonly border: "textMuted";
            };
            readonly focused: {
                readonly border: "contentBrand";
            };
            readonly invalid: {
                readonly border: "danger";
            };
        };
        readonly minHeight: 44;
        readonly multilineMinHeight: 80;
        readonly borderWidth: 1;
        readonly focusRingWidth: 2;
        readonly focusRingOffset: 2;
        readonly paddingHorizontal: 16;
        readonly paddingVertical: 12;
        readonly textVariant: "body";
        readonly label: {
            readonly color: "textBody";
            readonly textVariant: "body";
            readonly fontWeight: "600";
            readonly gap: 8;
        };
        readonly support: {
            readonly hintColor: "textMuted";
            readonly errorColor: "danger";
            readonly textVariant: "label";
            readonly gap: 6;
        };
        readonly placeholder: {
            readonly color: "textMuted";
        };
        readonly disabledOpacity: 0.6;
    };
    readonly filePickerRecipe: {
        readonly slots: readonly ["root", "trigger", "dropzone", "hint", "error"];
        readonly defaults: {
            readonly density: "regular";
        };
        readonly trigger: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
            readonly radius: "md";
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly fontWeight: "700";
        };
        readonly dropzone: {
            readonly borderStyle: "dashed";
            readonly borderWidth: 1;
            readonly borderColor: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly activeBorderColor: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly activeBackground: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly radius: "lg";
            readonly padding: 24;
        };
        readonly hint: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly error: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly disabledOpacity: 0.5;
        };
    };
    readonly iconButtonRecipe: {
        readonly slots: readonly ["root", "icon", "spinner"];
        readonly defaults: {
            readonly tone: "ghost";
            readonly size: "medium";
            readonly shape: "rounded";
        };
        readonly tones: {
            readonly primary: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "onPrimary";
                    alpha?: number;
                }>;
                readonly border: null;
            };
            readonly secondary: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "surfaceAlt";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
            };
            readonly ghost: {
                readonly background: null;
                readonly content: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly border: null;
            };
            readonly danger: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "dangerFill";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "onDanger";
                    alpha?: number;
                }>;
                readonly border: null;
            };
        };
        readonly sizes: {
            readonly small: {
                readonly diameter: 36;
                readonly hitSlop: 4;
                readonly glyph: "sm";
            };
            readonly medium: {
                readonly diameter: 44;
                readonly hitSlop: 0;
                readonly glyph: "md";
            };
            readonly large: {
                readonly diameter: 52;
                readonly hitSlop: 0;
                readonly glyph: "lg";
            };
        };
        readonly shapes: {
            readonly rounded: "md";
            readonly circle: "full";
        };
        readonly states: {
            readonly pressedOpacity: 0.86;
            readonly disabledOpacity: 0.5;
        };
    };
    readonly iconRecipe: {
        readonly slots: readonly ["root"];
        readonly defaults: {
            readonly size: "md";
            readonly tone: "secondary";
            readonly weight: "regular";
            readonly decorative: true;
        };
        readonly sizes: {
            readonly xs: 14;
            readonly sm: 20;
            readonly md: 24;
            readonly lg: 28;
            readonly xl: 32;
            readonly xxl: 44;
            readonly xxxl: 48;
        };
        readonly tones: {
            readonly primary: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly secondary: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly decorative: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
            readonly brand: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly info: Readonly<{
                source: "accent";
                key: "info";
                alpha?: number;
            }>;
            readonly success: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly warning: Readonly<{
                source: "accent";
                key: "warning";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly inverse: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
        };
        readonly weights: {
            readonly regular: 2;
            readonly strong: 2.5;
        };
        readonly stroke: {
            readonly lineCap: "round";
            readonly lineJoin: "round";
            readonly scaling: "proportional";
        };
    };
    readonly imageRecipe: {
        readonly slots: readonly ["root", "image", "placeholder", "fallbackIcon"];
        readonly defaults: {
            readonly fit: "cover";
        };
        readonly fits: readonly import("./image.js").ImageFit[];
        readonly placeholder: {
            readonly background: Readonly<{
                source: "theme";
                key: "surfaceAlt";
                alpha?: number;
            }>;
        };
        readonly fallback: {
            readonly background: Readonly<{
                source: "theme";
                key: "surfaceAlt";
                alpha?: number;
            }>;
            readonly icon: {
                readonly name: "error";
                readonly tone: "secondary";
            };
        };
        readonly radius: "md";
    };
    readonly linkRecipe: {
        readonly slots: readonly ["root", "leading", "label", "trailing"];
        readonly defaults: {
            readonly tone: "brand";
            readonly variant: "inline";
        };
        readonly tones: {
            readonly brand: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly neutral: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
        };
        readonly variants: {
            readonly inline: {
                readonly textVariant: "body";
                readonly fontWeight: "600";
                readonly underline: "always";
                readonly minHeight: null;
            };
            readonly standalone: {
                readonly textVariant: "body";
                readonly fontWeight: "700";
                readonly underline: "hover";
                readonly minHeight: 44;
            };
        };
        readonly gap: 4;
        readonly icon: {
            readonly glyph: "xs";
            readonly inheritsTone: true;
        };
        readonly states: {
            readonly pressedOpacity: 0.86;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly listRecipe: {
        readonly slots: readonly ["root", "item", "separator"];
        readonly defaults: {
            readonly separator: "indented";
        };
        readonly separators: {
            readonly none: null;
            readonly full: {
                readonly insetStart: 0;
                readonly insetEnd: 0;
            };
            readonly indented: {
                readonly insetStart: number;
                readonly insetEnd: 0;
            };
        };
        readonly background: null;
    };
    readonly listRowRecipe: {
        readonly slots: readonly ["root", "leading", "content", "title", "description", "trailing"];
        readonly defaults: {
            readonly density: "comfortable";
            readonly selected: false;
        };
        readonly density: {
            readonly compact: {
                readonly oneLineMinHeight: 44;
                readonly twoLineMinHeight: 60;
                readonly paddingHorizontal: 8;
                readonly paddingVertical: 4;
            };
            readonly comfortable: {
                readonly oneLineMinHeight: 56;
                readonly twoLineMinHeight: 68;
                readonly paddingHorizontal: 8;
                readonly paddingVertical: 8;
            };
        };
        readonly gap: 12;
        readonly leadingSize: 40;
        readonly title: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "bodyLarge";
            readonly fontWeight: "700";
        };
        readonly description: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly trailing: {
            readonly textColor: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly iconColor: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
            readonly glyph: "sm";
            readonly textVariant: "caption";
        };
        readonly states: {
            readonly pressedBackground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "surfaceAccent";
                alpha?: number;
            }>;
            readonly disabledOpacity: 0.5;
        };
    };
    readonly loadMoreRecipe: {
        readonly slots: readonly ["root", "status", "spinner", "trigger", "error", "retry", "end"];
        readonly defaults: {
            readonly mode: "automatic";
            readonly density: "regular";
        };
        readonly density: {
            readonly compact: {
                readonly paddingVertical: 12;
                readonly gap: 8;
            };
            readonly regular: {
                readonly paddingVertical: 20;
                readonly gap: 12;
            };
        };
        readonly status: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly error: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly end: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "caption";
        };
        readonly trigger: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
            readonly radius: "md";
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly fontWeight: "700";
        };
        readonly spinner: {
            readonly size: "small";
            readonly tone: "brand";
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly pressedOpacity: 0.86;
            readonly disabledOpacity: 0.5;
        };
    };
    readonly menuRecipe: {
        readonly slots: readonly ["trigger", "content", "viewport", "section", "sectionLabel", "item", "leading", "copy", "label", "description", "trailing", "shortcut", "indicator", "dangerIndicator", "separator"];
        readonly defaults: {
            readonly density: "comfortable";
            readonly itemTone: "neutral";
        };
        readonly surface: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "md";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly padding: 8;
        };
        readonly density: {
            readonly compact: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 12;
                readonly gap: 12;
                readonly radius: "md";
                readonly label: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textBody";
                        alpha?: number;
                    }>;
                    readonly textVariant: "body";
                };
                readonly description: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textMuted";
                        alpha?: number;
                    }>;
                    readonly textVariant: "label";
                };
                readonly highlightedBackground: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly focus: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "contentBrand";
                        alpha?: number;
                    }>;
                    readonly width: 2;
                    readonly offset: 2;
                };
                readonly selectedBackground: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly selectedIndicator: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly danger: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
            readonly comfortable: {
                readonly minHeight: 56;
                readonly paddingHorizontal: 12;
                readonly gap: 12;
                readonly radius: "md";
                readonly label: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textBody";
                        alpha?: number;
                    }>;
                    readonly textVariant: "body";
                };
                readonly description: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textMuted";
                        alpha?: number;
                    }>;
                    readonly textVariant: "label";
                };
                readonly highlightedBackground: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly focus: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "contentBrand";
                        alpha?: number;
                    }>;
                    readonly width: 2;
                    readonly offset: 2;
                };
                readonly selectedBackground: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly selectedIndicator: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly danger: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
        };
        readonly tones: {
            readonly neutral: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly sectionLabel: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly paddingHorizontal: 12;
            readonly paddingVertical: 8;
        };
        readonly leading: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly shortcut: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "caption";
        };
        readonly indicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly separator: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly dangerIndicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly glyph: "sm";
            readonly mark: "alert";
        };
        readonly minWidth: 220;
        readonly maxWidth: 320;
        readonly maxHeight: 360;
        readonly sideOffset: 8;
        readonly collisionPadding: 8;
        readonly states: {
            readonly disabledOpacity: 0.5;
        };
        readonly transition: {
            readonly enter: {
                readonly duration: 200;
                readonly easing: "enter";
                readonly reducedMotion: "opacity";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
    };
    readonly noticeRecipe: {
        readonly slots: readonly ["root", "icon", "content", "title", "description", "action"];
        readonly defaults: {
            readonly tone: "info";
        };
        readonly tones: {
            readonly info: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "surfaceAlt";
                    alpha?: number;
                }>;
                readonly foreground: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly badgeBackground: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
            };
            readonly success: {
                readonly foreground: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly badgeBackground: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
            };
            readonly warning: {
                readonly foreground: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
                readonly badgeBackground: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
            };
            readonly attention: {
                readonly foreground: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly badgeBackground: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
            };
            readonly danger: {
                readonly foreground: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly background: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly badgeBackground: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
        };
        readonly radius: "md";
        readonly padding: 16;
        readonly gap: 12;
        readonly contentGap: 4;
        readonly iconSize: "sm";
        readonly borderWidth: 1;
        readonly title: {
            readonly textVariant: "body";
            readonly fontWeight: "700";
        };
        readonly description: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
    };
    readonly paginationRecipe: {
        readonly slots: readonly ["root", "item", "ellipsis", "previous", "next"];
        readonly gap: 4;
        readonly item: {
            readonly minSize: 44;
            readonly radius: "md";
            readonly color: {
                readonly default: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly current: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
            };
            readonly background: {
                readonly hover: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
            };
            readonly border: {
                readonly current: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
            };
        };
        readonly ellipsis: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly icon: "more";
        };
        readonly navIcon: {
            readonly previous: "chevronStart";
            readonly next: "chevronEnd";
        };
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
        readonly states: {
            readonly disabledOpacity: 0.5;
        };
    };
    readonly popoverRecipe: {
        readonly slots: readonly ["trigger", "content", "arrow", "closeAction"];
        readonly surface: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "md";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly padding: 8;
        };
        readonly arrow: {
            readonly size: 4;
            readonly offset: 4;
        };
        readonly sideOffset: 8;
        readonly collisionPadding: 8;
        readonly minWidth: 240;
        readonly maxWidth: 360;
        readonly transition: {
            readonly enter: {
                readonly duration: 200;
                readonly easing: "enter";
                readonly reducedMotion: "opacity";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
    };
    readonly numberFieldRecipe: {
        readonly slots: readonly ["root", "frame", "input", "decrement", "increment", "description", "error"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly frame: {
            readonly background: Readonly<{
                source: "theme";
                key: "surface";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly focusBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly radius: "md";
            readonly borderWidth: 1;
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
        };
        readonly support: {
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
                readonly fontWeight: "600";
            };
            readonly hint: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly error: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly gap: 8;
        };
        readonly sizes: {
            readonly medium: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 16;
                readonly textVariant: "body";
                readonly stepperDiameter: 44;
            };
            readonly large: {
                readonly minHeight: 52;
                readonly paddingHorizontal: 20;
                readonly textVariant: "bodyLarge";
                readonly stepperDiameter: 44;
            };
        };
        readonly value: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly numericVariant: "tabular";
        };
        readonly stepper: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly minTarget: 44;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly disabledOpacity: 0.5;
        };
    };
    readonly progressRecipe: {
        readonly slots: readonly ["root", "track", "indicator", "label", "value"];
        readonly defaults: {
            readonly size: "medium";
            readonly tone: "brand";
        };
        readonly sizes: {
            readonly small: 4;
            readonly medium: 8;
            readonly large: 12;
        };
        readonly tones: {
            readonly brand: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly success: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly warning: Readonly<{
                source: "accent";
                key: "warning";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly track: Readonly<{
            source: "theme";
            key: "surfaceAlt";
            alpha?: number;
        }>;
        readonly radius: "full";
    };
    readonly resultRecipe: {
        readonly slots: readonly ["root", "icon", "title", "description", "primaryAction", "secondaryAction"];
        readonly defaults: {
            readonly status: "info";
        };
        readonly tones: {
            readonly success: {
                readonly icon: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly iconBackground: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
            };
            readonly failure: {
                readonly icon: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly iconBackground: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
            readonly info: {
                readonly icon: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly iconBackground: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
            };
        };
        readonly iconSize: "xl";
        readonly paddingVertical: 40;
        readonly paddingHorizontal: 24;
        readonly gap: 12;
        readonly title: {
            readonly textVariant: "titleLarge";
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly fontWeight: "700";
        };
        readonly description: {
            readonly textVariant: "body";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly actionsGap: 12;
    };
    readonly searchFieldRecipe: {
        readonly slots: readonly ["root", "leading", "input", "trailing", "clear", "spinner"];
        readonly defaults: {
            readonly size: "medium";
            readonly shape: "medium";
        };
        readonly sizes: {
            readonly medium: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 12;
                readonly gap: 8;
                readonly glyph: "sm";
                readonly clearDiameter: 36;
                readonly clearHitSlop: 4;
                readonly textVariant: "body";
            };
            readonly large: {
                readonly minHeight: 52;
                readonly paddingHorizontal: 16;
                readonly gap: 12;
                readonly glyph: "sm";
                readonly clearDiameter: 44;
                readonly clearHitSlop: 0;
                readonly textVariant: "bodyLarge";
            };
        };
        readonly colors: {
            readonly background: Readonly<{
                source: "theme";
                key: "surface";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly placeholder: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly leading: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
            readonly clear: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly focus: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly invalid: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly shapes: {
            readonly medium: "md";
            readonly large: "lg";
            readonly full: "full";
        };
        readonly borderWidth: 1;
        readonly focusRingWidth: 2;
        readonly focusRingOffset: 2;
        readonly states: {
            readonly disabledOpacity: 0.5;
            readonly pressedOpacity: 0.86;
        };
    };
    readonly selectRecipe: {
        readonly slots: readonly ["root", "label", "trigger", "leading", "value", "placeholder", "busyIndicator", "indicator", "description", "error", "popover", "viewport", "section", "sectionLabel", "option", "optionLeading", "optionCopy", "optionLabel", "optionDescription", "selectionIndicator", "stateMessage"];
        readonly defaults: {
            readonly size: "medium";
            readonly density: "comfortable";
        };
        readonly adaptive: {
            readonly web: "popover";
            readonly native: "sheet";
        };
        readonly frame: {
            readonly background: Readonly<{
                source: "theme";
                key: "surface";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly focusBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly radius: "md";
            readonly borderWidth: 1;
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
        };
        readonly sizes: {
            readonly medium: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 16;
                readonly textVariant: "body";
                readonly glyph: "sm";
            };
            readonly large: {
                readonly minHeight: 52;
                readonly paddingHorizontal: 20;
                readonly textVariant: "bodyLarge";
                readonly glyph: "md";
            };
        };
        readonly support: {
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
                readonly fontWeight: "600";
            };
            readonly hint: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly error: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly gap: 8;
        };
        readonly value: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly placeholderColor: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly gap: 12;
        };
        readonly leading: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly indicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly busyIndicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly popover: {
            readonly minWidth: 220;
            readonly maxWidth: 420;
            readonly maxHeight: 360;
            readonly sideOffset: 8;
            readonly collisionPadding: 8;
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "md";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly padding: 8;
        };
        readonly density: {
            readonly compact: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 12;
                readonly gap: 12;
                readonly radius: "md";
                readonly label: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textBody";
                        alpha?: number;
                    }>;
                    readonly textVariant: "body";
                };
                readonly description: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textMuted";
                        alpha?: number;
                    }>;
                    readonly textVariant: "label";
                };
                readonly highlightedBackground: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly focus: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "contentBrand";
                        alpha?: number;
                    }>;
                    readonly width: 2;
                    readonly offset: 2;
                };
                readonly selectedBackground: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly selectedIndicator: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly danger: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
            readonly comfortable: {
                readonly minHeight: 56;
                readonly paddingHorizontal: 12;
                readonly gap: 12;
                readonly radius: "md";
                readonly label: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textBody";
                        alpha?: number;
                    }>;
                    readonly textVariant: "body";
                };
                readonly description: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "textMuted";
                        alpha?: number;
                    }>;
                    readonly textVariant: "label";
                };
                readonly highlightedBackground: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly focus: {
                    readonly color: Readonly<{
                        source: "theme";
                        key: "contentBrand";
                        alpha?: number;
                    }>;
                    readonly width: 2;
                    readonly offset: 2;
                };
                readonly selectedBackground: Readonly<{
                    source: "theme";
                    key: "primary";
                    alpha?: number;
                }>;
                readonly selectedIndicator: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly danger: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
        };
        readonly sectionLabel: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly paddingHorizontal: 12;
            readonly paddingVertical: 8;
        };
        readonly optionLeading: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly optionLabel: {
            readonly fontWeight: "600";
            readonly selectedFontWeight: "700";
        };
        readonly selectionIndicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly glyph: "sm";
        };
        readonly stateMessage: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly paddingVertical: 12;
        };
        readonly states: {
            readonly hoverBackground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly pressedBackground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly disabledOpacity: 0.5;
        };
        readonly transition: {
            readonly web: {
                readonly enter: {
                    readonly duration: 120;
                    readonly easing: "standard";
                    readonly reducedMotion: "instant";
                };
                readonly exit: {
                    readonly duration: 120;
                    readonly easing: "exit";
                    readonly reducedMotion: "instant";
                };
            };
            readonly native: {
                readonly enter: {
                    readonly duration: 200;
                    readonly easing: "enter";
                    readonly reducedMotion: "opacity";
                };
                readonly exit: {
                    readonly duration: 120;
                    readonly easing: "exit";
                    readonly reducedMotion: "instant";
                };
            };
        };
    };
    readonly selectionGroupRecipe: {
        readonly slots: readonly ["root", "label", "requiredIndicator", "description", "items", "error"];
        readonly defaults: {
            readonly orientation: "vertical";
            readonly presentation: "card";
        };
        readonly orientations: {
            readonly vertical: {
                readonly direction: "column";
                readonly gap: {
                    readonly plain: 4;
                    readonly card: 8;
                    readonly grouped: 0;
                };
            };
            readonly horizontal: {
                readonly direction: "row";
                readonly gap: {
                    readonly plain: 12;
                    readonly card: 16;
                    readonly grouped: 0;
                };
            };
        };
        readonly label: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly fontWeight: "600";
        };
        readonly requiredIndicator: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly description: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly error: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly supportGap: 8;
        readonly states: {
            readonly disabledOpacity: 0.5;
        };
    };
    readonly sectionRecipe: {
        readonly slots: readonly ["root", "header", "copy", "title", "description", "action", "content"];
        readonly gap: 8;
        readonly headerGap: 12;
        readonly copyGap: 4;
        readonly title: {
            readonly textVariant: "title";
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly fontWeight: "700";
        };
        readonly description: {
            readonly textVariant: "caption";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
    };
    readonly segmentedControlRecipe: {
        readonly slots: readonly ["root", "item", "label", "indicator"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly container: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "lg";
            readonly padding: 4;
            readonly gap: 4;
        };
        readonly sizes: {
            readonly small: {
                readonly minHeight: 36;
                readonly hitSlop: 4;
                readonly paddingHorizontal: 12;
                readonly textVariant: "label";
            };
            readonly medium: {
                readonly minHeight: 44;
                readonly hitSlop: 0;
                readonly paddingHorizontal: 16;
                readonly textVariant: "body";
            };
        };
        readonly item: {
            readonly radius: "md";
            readonly gap: 4;
            readonly idleContent: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly fontWeight: "600";
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "surfaceAccent";
                alpha?: number;
            }>;
            readonly selectedContent: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly selectedBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly selectedBorderWidth: 2;
            readonly selectedFontWeight: "700";
            readonly focusRing: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly pressedOpacity: 0.86;
            readonly disabledOpacity: 0.5;
        };
    };
    readonly selectionControlRecipe: {
        readonly slots: readonly ["root", "control", "indicator", "leading", "content", "label", "description"];
        readonly defaults: {
            readonly kind: "checkbox";
            readonly size: "medium";
            readonly presentation: "card";
        };
        readonly sizes: {
            readonly small: {
                readonly rowMinHeight: 44;
                readonly control: 20;
                readonly hitSlop: 12;
                readonly glyph: "xs";
                readonly gap: 8;
                readonly paddingHorizontal: 12;
                readonly paddingVertical: 8;
                readonly labelVariant: "label";
                readonly descriptionVariant: "caption";
            };
            readonly medium: {
                readonly rowMinHeight: 56;
                readonly control: 24;
                readonly hitSlop: 10;
                readonly glyph: "sm";
                readonly gap: 12;
                readonly paddingHorizontal: 16;
                readonly paddingVertical: 12;
                readonly labelVariant: "body";
                readonly descriptionVariant: "label";
            };
        };
        readonly shapes: {
            readonly checkbox: "sm";
            readonly radio: "full";
        };
        readonly presentations: {
            readonly plain: {
                readonly background: null;
                readonly border: null;
                readonly borderWidth: 0;
                readonly radius: "md";
                readonly useSizePadding: false;
                readonly labelColor: null;
            };
            readonly card: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "surface";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
                readonly borderWidth: 1;
                readonly radius: "md";
                readonly useSizePadding: true;
                readonly labelColor: null;
            };
            readonly grouped: {
                readonly background: null;
                readonly border: null;
                readonly borderWidth: 0;
                readonly radius: "lg";
                readonly useSizePadding: true;
                readonly labelColor: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
            };
        };
        readonly label: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly fontWeight: "600";
            readonly checkedFontWeight: "700";
        };
        readonly leading: {
            readonly size: "md";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly description: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly indicators: {
            readonly checkbox: {
                readonly checked: "check";
                readonly mixed: "dash";
            };
            readonly radio: {
                readonly checked: "dot";
                readonly mixed: null;
            };
        };
        readonly radioDotRatio: 0.42;
        readonly states: {
            readonly idleBackground: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly idleBorder: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly checkedBackground: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly checkedBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly indicator: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "surfaceAccent";
                alpha?: number;
            }>;
            readonly selectedBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly hoverBackground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly pressedBackground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly disabledOpacity: 0.5;
        };
    };
    readonly sheetRecipe: {
        readonly slots: readonly ["backdrop", "positioner", "content", "handle", "header", "title", "body", "footer", "close"];
        readonly defaults: {
            readonly placement: "bottom";
        };
        readonly backdrop: {
            readonly color: "#000000";
            readonly opacity: 0.6;
        };
        readonly content: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "xl";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly maxHeightRatio: 0.9;
            readonly paddingHorizontal: 20;
            readonly paddingTop: 12;
            readonly paddingBottom: 12;
        };
        readonly web: {
            readonly maxWidth: 640;
        };
        readonly safeArea: {
            readonly edge: "bottom";
            readonly mode: "additive";
            readonly minimumPadding: 12;
        };
        readonly handle: {
            readonly width: 36;
            readonly height: 4;
            readonly radius: "full";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly visibleByDefault: false;
            readonly showWhen: "swipe-dismiss-enabled";
        };
        readonly header: {
            readonly minHeight: 44;
            readonly gap: 12;
        };
        readonly title: {
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly textVariant: "title";
            readonly fontWeight: "700";
            readonly gap: 4;
        };
        readonly body: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly gap: 16;
        };
        readonly footer: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly gap: 12;
            readonly paddingTop: 12;
        };
        readonly transition: {
            readonly enter: {
                readonly duration: 200;
                readonly easing: "enter";
                readonly reducedMotion: "opacity";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
    };
    readonly sidePanelRecipe: {
        readonly slots: readonly ["backdrop", "positioner", "content", "header", "title", "body", "footer", "close"];
        readonly defaults: {
            readonly edge: "end";
            readonly size: "regular";
        };
        readonly sizes: {
            readonly compact: 320;
            readonly regular: 400;
            readonly wide: 560;
        };
        readonly backdrop: {
            readonly color: "#000000";
            readonly opacity: 0.6;
        };
        readonly content: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: null;
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.16;
                readonly radius: 24;
                readonly offsetY: 8;
            };
            readonly paddingHorizontal: 20;
            readonly paddingTop: 12;
            readonly paddingBottom: 12;
        };
        readonly header: {
            readonly minHeight: 44;
            readonly gap: 12;
        };
        readonly title: {
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly textVariant: "title";
            readonly fontWeight: "700";
        };
        readonly body: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly gap: 16;
        };
        readonly footer: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly gap: 12;
            readonly paddingTop: 12;
        };
        readonly transition: {
            readonly enter: {
                readonly duration: 200;
                readonly easing: "enter";
                readonly reducedMotion: "opacity";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly commandPaletteRecipe: {
        readonly slots: readonly ["backdrop", "positioner", "content", "searchField", "viewport", "section", "sectionLabel", "item", "leading", "copy", "label", "description", "shortcut", "emptyState"];
        readonly backdrop: {
            readonly color: "#000000";
            readonly opacity: 0.6;
        };
        readonly content: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "lg";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly maxWidth: 560;
            readonly maxHeight: 420;
        };
        readonly searchField: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
            readonly borderColor: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly item: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly gap: 12;
            readonly radius: "md";
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
            };
            readonly description: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly highlightedBackground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly selectedIndicator: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly sectionLabel: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly paddingHorizontal: 12;
            readonly paddingVertical: 8;
        };
        readonly emptyState: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly paddingVertical: 24;
        };
        readonly transition: {
            readonly enter: {
                readonly duration: 200;
                readonly easing: "enter";
                readonly reducedMotion: "opacity";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
    };
    readonly layoutRecipe: {
        readonly slots: readonly ["root", "skipLink", "header", "sidebar", "main", "footer"];
        readonly defaults: {};
        readonly main: {
            readonly maxWidth: 1200;
            readonly paddingHorizontal: 20;
        };
        readonly sidebar: {
            readonly width: 280;
        };
        readonly skipLink: {
            readonly visibility: "focus-only";
            readonly background: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly color: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
            readonly paddingHorizontal: 16;
            readonly paddingVertical: 12;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly otpFieldRecipe: {
        readonly slots: readonly ["root", "input", "slot", "description", "error"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly support: {
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
                readonly fontWeight: "600";
            };
            readonly hint: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly error: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly gap: 8;
        };
        readonly sizes: {
            readonly medium: {
                readonly slotSize: 44;
                readonly gap: 8;
                readonly textVariant: "title";
            };
            readonly large: {
                readonly slotSize: 52;
                readonly gap: 12;
                readonly textVariant: "titleLarge";
            };
        };
        readonly slot: {
            readonly border: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly focusBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly filledBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly radius: "md";
            readonly borderWidth: 1;
            readonly content: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly disabledOpacity: 0.5;
        };
    };
    readonly passwordFieldRecipe: {
        readonly slots: readonly ["root", "frame", "input", "toggle", "description", "error"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly frame: {
            readonly background: Readonly<{
                source: "theme";
                key: "surface";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly focusBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly radius: "md";
            readonly borderWidth: 1;
            readonly minHeight: 44;
            readonly paddingHorizontal: 16;
        };
        readonly support: {
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
                readonly fontWeight: "600";
            };
            readonly hint: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly error: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly gap: 8;
        };
        readonly sizes: {
            readonly medium: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 16;
                readonly textVariant: "body";
                readonly toggleDiameter: 44;
            };
            readonly large: {
                readonly minHeight: 52;
                readonly paddingHorizontal: 20;
                readonly textVariant: "bodyLarge";
                readonly toggleDiameter: 44;
            };
        };
        readonly value: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
        };
        readonly toggle: {
            readonly icons: {
                readonly concealed: "visibility";
                readonly revealed: "visibilityOff";
            };
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly invalidBorder: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly disabledOpacity: 0.5;
        };
    };
    readonly splitterRecipe: {
        readonly slots: readonly ["root", "pane", "separator", "handle"];
        readonly defaults: {
            readonly axis: "horizontal";
        };
        readonly separator: {
            readonly thickness: 1;
            readonly hitTarget: 44;
            readonly color: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly hoverColor: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
            readonly activeColor: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly floatingActionButtonRecipe: {
        readonly slots: readonly ["root", "icon", "label"];
        readonly defaults: {
            readonly layoutMode: "expanded";
        };
        readonly circle: {
            readonly diameter: 52;
            readonly hitSlop: 0;
            readonly glyph: "lg";
        };
        readonly tone: {
            readonly background: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
            readonly border: null;
        };
        readonly shape: "full";
        readonly expandedLabel: {
            readonly textVariant: "bodyLarge";
            readonly paddingHorizontal: 20;
        };
        readonly margin: 16;
        readonly shadow: {
            readonly color: "#000000";
            readonly opacity: 0.12;
            readonly radius: 12;
            readonly offsetY: 4;
        };
        readonly transition: {
            readonly duration: 120;
            readonly easing: "standard";
            readonly reducedMotion: "instant";
        };
    };
    readonly tourRecipe: {
        readonly slots: readonly ["backdrop", "card", "title", "description", "counter", "previousAction", "nextAction", "skipAction"];
        readonly card: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "md";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly padding: 8;
        };
        readonly backdrop: {
            readonly color: "#000000";
            readonly opacity: 0.6;
        };
        readonly maxWidth: 320;
        readonly gap: 12;
        readonly sideOffset: 8;
        readonly transition: {
            readonly enter: {
                readonly duration: 320;
                readonly easing: "emphasized";
                readonly reducedMotion: "opacity";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
    };
    readonly transferListRecipe: {
        readonly slots: readonly ["root", "panel", "panelHeader", "panelTitle", "panelCount", "list", "item", "itemCheckbox", "emptyState", "moveControls", "moveButton"];
        readonly panel: {
            readonly background: Readonly<{
                source: "theme";
                key: "surface";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "md";
        };
        readonly panelHeader: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly title: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
            };
            readonly count: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
        };
        readonly item: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly gap: 12;
            readonly radius: "md";
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
            };
            readonly description: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly highlightedBackground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly selectedIndicator: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly emptyState: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly moveControls: {
            readonly gap: 12;
        };
        readonly moveButton: {
            readonly minTarget: 44;
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly disabledOpacity: 0.4;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
    };
    readonly skeletonRecipe: {
        readonly slots: readonly ["root"];
        readonly defaults: {
            readonly shape: "block";
            readonly animated: false;
        };
        readonly background: Readonly<{
            source: "theme";
            key: "surfaceAlt";
            alpha?: number;
        }>;
        readonly shapes: {
            readonly block: {
                readonly radius: "md";
                readonly defaultHeight: 32;
            };
            readonly text: {
                readonly radius: "sm";
                readonly defaultHeight: 16;
            };
            readonly circle: {
                readonly radius: "full";
                readonly defaultHeight: 44;
            };
        };
        readonly animation: {
            readonly duration: number;
            readonly easing: "standard";
            readonly fromOpacity: 0.56;
            readonly toOpacity: 1;
            readonly reducedMotion: "static";
        };
    };
    readonly sliderRecipe: {
        readonly slots: readonly ["root", "track", "filledTrack", "thumb", "label", "valueLabel"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly sizes: {
            readonly medium: {
                readonly trackHeight: 4;
                readonly thumbDiameter: 20;
                readonly hitTarget: 44;
                readonly labelVariant: "body";
                readonly valueLabelVariant: "label";
            };
        };
        readonly colors: {
            readonly trackFilled: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly trackUnfilled: Readonly<{
                source: "theme";
                key: "surfaceAlt";
                alpha?: number;
            }>;
            readonly trackUnfilledBorder: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly thumb: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly thumbBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly label: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly valueLabel: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly disabledOpacity: 0.5;
            readonly draggedOpacity: 0.64;
        };
        readonly radius: "full";
    };
    readonly spinnerRecipe: {
        readonly slots: readonly ["root"];
        readonly defaults: {
            readonly size: "medium";
            readonly tone: "brand";
        };
        readonly sizes: {
            readonly small: 14;
            readonly medium: 20;
            readonly large: 28;
        };
        readonly tones: {
            readonly brand: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly neutral: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly inverse: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
        };
        readonly strokeWidth: 2;
        readonly animation: {
            readonly duration: 800;
            readonly easing: "standard";
            readonly reducedMotion: "static";
        };
    };
    readonly stackRecipe: {
        readonly slots: readonly ["root"];
        readonly defaults: {
            readonly axis: "block";
            readonly gap: "md";
            readonly align: "stretch";
            readonly justify: "start";
            readonly wrap: false;
        };
        readonly axes: {
            readonly block: "column";
            readonly inline: "row";
        };
        readonly gaps: {
            readonly xxs: 4;
            readonly xs: 8;
            readonly sm: 12;
            readonly md: 16;
            readonly lg: 20;
            readonly xl: 24;
            readonly xxl: 32;
            readonly xxxl: 40;
        };
        readonly align: readonly ["start", "center", "end", "stretch"];
        readonly justify: readonly ["start", "center", "end", "between"];
    };
    readonly statisticRecipe: {
        readonly slots: readonly ["group", "root", "label", "valueRow", "prefix", "value", "suffix", "trend", "trendMark", "hint"];
        readonly defaults: {
            readonly density: "comfortable";
            readonly presentation: "plain";
            readonly columns: 3;
        };
        readonly density: {
            readonly compact: {
                readonly padding: 12;
                readonly gap: 4;
                readonly labelVariant: "caption";
                readonly valueVariant: "title";
            };
            readonly comfortable: {
                readonly padding: 16;
                readonly gap: 8;
                readonly labelVariant: "label";
                readonly valueVariant: "heading";
            };
        };
        readonly presentations: {
            readonly plain: {
                readonly background: null;
                readonly border: null;
                readonly borderWidth: 0;
                readonly radius: "md";
            };
            readonly surface: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "surface";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
                readonly borderWidth: 1;
                readonly radius: "md";
            };
        };
        readonly group: {
            readonly gap: 8;
            readonly minItemWidth: 120;
            readonly columns: readonly [1, 2, 3, 4];
        };
        readonly label: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly fontWeight: "600";
        };
        readonly value: {
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly fontWeight: "800";
            readonly numericVariant: "tabular";
            readonly maxLines: null;
        };
        readonly affix: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly fontWeight: "600";
        };
        readonly hint: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "caption";
        };
        readonly trend: {
            readonly textVariant: "caption";
            readonly fontWeight: "700";
            readonly gap: 4;
            readonly marks: {
                readonly up: "trendUp";
                readonly down: "trendDown";
                readonly flat: "trendFlat";
            };
            readonly tones: {
                readonly neutral: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly success: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly warning: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
                readonly danger: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
        };
    };
    readonly stepsRecipe: {
        readonly slots: readonly ["root", "step", "indicator", "marker", "connector", "label", "description"];
        readonly gap: 8;
        readonly indicator: {
            readonly size: 24;
            readonly borderWidth: 1;
            readonly activeBorderWidth: 2;
            readonly marks: {
                readonly pending: null;
                readonly current: null;
                readonly complete: "check";
                readonly error: "error";
            };
            readonly border: {
                readonly pending: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
                readonly current: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly complete: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly error: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
            readonly background: {
                readonly pending: null;
                readonly current: null;
                readonly complete: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly error: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
            readonly content: {
                readonly pending: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly current: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly complete: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly error: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
        };
        readonly connector: {
            readonly height: 1;
            readonly tone: {
                readonly reached: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly unreached: Readonly<{
                    source: "theme";
                    key: "border";
                    alpha?: number;
                }>;
            };
        };
        readonly label: {
            readonly textVariant: "label";
            readonly fontWeight: "600";
            readonly color: {
                readonly pending: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly current: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly complete: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly error: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
            };
        };
        readonly description: {
            readonly textVariant: "caption";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
    };
    readonly surfaceRecipe: {
        readonly default: {
            readonly background: "surface";
            readonly border: "border";
            readonly borderAlpha: 1;
            readonly elevated: false;
            readonly borderAlways: false;
        };
        readonly raised: {
            readonly background: "bg";
            readonly border: "border";
            readonly borderAlpha: 1;
            readonly elevated: true;
            readonly borderAlways: false;
        };
        readonly accent: {
            readonly background: "surfaceAccent";
            readonly border: "primary";
            readonly borderAlpha: 0.3;
            readonly elevated: false;
            readonly borderAlways: false;
        };
        readonly subtle: {
            readonly background: "bg";
            readonly border: "border";
            readonly borderAlpha: 1;
            readonly elevated: false;
            readonly borderAlways: true;
        };
    };
    readonly switchRecipe: {
        readonly slots: readonly ["root", "track", "thumb", "label", "description"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly sizes: {
            readonly small: {
                readonly width: 44;
                readonly height: 26;
                readonly thumb: 22;
                readonly inset: 2;
            };
            readonly medium: {
                readonly width: 52;
                readonly height: 32;
                readonly thumb: 28;
                readonly inset: 2;
            };
        };
        readonly colors: {
            readonly trackOff: Readonly<{
                source: "theme";
                key: "surfaceAlt";
                alpha?: number;
            }>;
            readonly trackOffBorder: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly trackOn: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly trackOnBorder: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly thumbOff: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly thumbOffBorder: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly thumbOn: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly trackOffDisabled: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly trackOffBorderDisabled: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly trackOnDisabled: {
                readonly alpha: 0.38;
                readonly source: "theme";
                readonly key: "contentBrand";
            };
            readonly trackOnBorderDisabled: {
                readonly alpha: 0.38;
                readonly source: "theme";
                readonly key: "contentBrand";
            };
            readonly thumbDisabled: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly thumbDisabledBorder: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
        };
        readonly states: {
            readonly disabledOpacity: 0.5;
            readonly pressedOpacity: 0.86;
        };
        readonly rowMinHeight: 44;
        readonly rowTwoLineMinHeight: 68;
    };
    readonly tabsRecipe: {
        readonly slots: readonly ["root", "list", "tab", "label", "indicator", "panel"];
        readonly defaults: {
            readonly size: "medium";
            readonly layout: "content";
            readonly overflow: "scroll";
        };
        readonly sizes: {
            readonly small: {
                readonly minHeight: 44;
                readonly paddingHorizontal: 12;
                readonly textVariant: "label";
            };
            readonly medium: {
                readonly minHeight: 48;
                readonly paddingHorizontal: 16;
                readonly textVariant: "body";
            };
        };
        readonly colors: {
            readonly idle: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly selected: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly indicator: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly divider: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
        };
        readonly gap: 8;
        readonly icon: {
            readonly glyph: "xs";
        };
        readonly label: {
            readonly fontWeight: "600";
            readonly selectedFontWeight: "700";
        };
        readonly layouts: {
            readonly content: {
                readonly fitted: false;
            };
            readonly fitted: {
                readonly fitted: true;
            };
        };
        readonly overflow: {
            readonly scroll: {
                readonly scrollable: true;
                readonly wrap: false;
            };
            readonly clip: {
                readonly scrollable: false;
                readonly wrap: false;
            };
        };
        readonly indicatorHeight: 2;
        readonly states: {
            readonly pressedBackground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly disabledOpacity: 0.5;
        };
    };
    readonly tagRecipe: {
        readonly slots: readonly ["root", "label"];
        readonly defaults: {
            readonly tone: "neutral";
        };
        readonly tones: {
            readonly neutral: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "surfaceAlt";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly border: null;
            };
            readonly brand: {
                readonly background: Readonly<{
                    source: "theme";
                    key: "surfaceAccent";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly border: null;
            };
            readonly info: {
                readonly background: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
            };
            readonly success: {
                readonly background: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
            };
            readonly attention: {
                readonly background: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly content: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
                readonly border: Readonly<{
                    source: "accent";
                    key: "attention";
                    alpha?: number;
                }>;
            };
        };
        readonly size: {
            readonly height: 20;
            readonly paddingHorizontal: 4;
            readonly gap: 4;
            readonly textVariant: "caption";
            readonly fontWeight: "600";
        };
        readonly radius: "sm";
        readonly borderWidth: 1;
    };
    readonly textRecipe: {
        readonly slots: readonly ["root"];
        readonly defaults: {
            readonly variant: "body";
            readonly tone: "primary";
            readonly emphasis: "regular";
        };
        readonly tones: {
            readonly primary: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly body: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly muted: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly subtle: Readonly<{
                source: "theme";
                key: "textSub";
                alpha?: number;
            }>;
            readonly weak: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
            readonly brand: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly inverse: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
        };
        readonly emphasis: {
            readonly regular: "400";
            readonly medium: "600";
            readonly strong: "700";
        };
    };
    readonly timelineRecipe: {
        readonly slots: readonly ["root", "item", "dot", "connector", "content", "timestamp", "label", "description"];
        readonly gap: 16;
        readonly dot: {
            readonly diameter: 10;
            readonly borderWidth: 1;
            readonly tones: {
                readonly neutral: {
                    readonly border: null;
                    readonly fill: Readonly<{
                        source: "theme";
                        key: "textMuted";
                        alpha?: number;
                    }>;
                };
                readonly info: {
                    readonly border: Readonly<{
                        source: "accent";
                        key: "info";
                        alpha?: number;
                    }>;
                    readonly fill: Readonly<{
                        source: "accent";
                        key: "info";
                        alpha?: number;
                    }>;
                };
                readonly success: {
                    readonly border: Readonly<{
                        source: "accent";
                        key: "success";
                        alpha?: number;
                    }>;
                    readonly fill: Readonly<{
                        source: "accent";
                        key: "success";
                        alpha?: number;
                    }>;
                };
                readonly attention: {
                    readonly border: Readonly<{
                        source: "accent";
                        key: "attention";
                        alpha?: number;
                    }>;
                    readonly fill: Readonly<{
                        source: "accent";
                        key: "attention";
                        alpha?: number;
                    }>;
                };
            };
        };
        readonly connector: {
            readonly width: 1;
            readonly tone: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
        };
        readonly timestamp: {
            readonly textVariant: "caption";
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
        };
        readonly label: {
            readonly textVariant: "body";
            readonly fontWeight: "600";
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
        };
        readonly description: {
            readonly textVariant: "body";
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
        };
    };
    readonly toastRecipe: {
        readonly slots: readonly ["viewport", "root", "toneMark", "icon", "content", "title", "description", "action", "close"];
        readonly defaults: {
            readonly tone: "neutral";
            readonly placement: "bottom";
            readonly durationMs: 5000;
        };
        readonly adaptive: {
            readonly web: "fixed-viewport";
            readonly native: "safe-area-overlay";
        };
        readonly viewport: {
            readonly layer: 1000;
            readonly gap: 12;
            readonly inset: 16;
            readonly maxWidth: 420;
            readonly safeAreaMode: "additive";
        };
        readonly placements: {
            readonly top: {
                readonly blockEdge: "top";
                readonly inlineEdge: "center";
                readonly stackFrom: "top";
            };
            readonly "top-start": {
                readonly blockEdge: "top";
                readonly inlineEdge: "start";
                readonly stackFrom: "top";
            };
            readonly "top-end": {
                readonly blockEdge: "top";
                readonly inlineEdge: "end";
                readonly stackFrom: "top";
            };
            readonly bottom: {
                readonly blockEdge: "bottom";
                readonly inlineEdge: "center";
                readonly stackFrom: "bottom";
            };
            readonly "bottom-start": {
                readonly blockEdge: "bottom";
                readonly inlineEdge: "start";
                readonly stackFrom: "bottom";
            };
            readonly "bottom-end": {
                readonly blockEdge: "bottom";
                readonly inlineEdge: "end";
                readonly stackFrom: "bottom";
            };
        };
        readonly tones: {
            readonly neutral: {
                readonly foreground: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly accent: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly mark: "notifications";
            };
            readonly info: {
                readonly foreground: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly accent: Readonly<{
                    source: "accent";
                    key: "info";
                    alpha?: number;
                }>;
                readonly mark: "info";
            };
            readonly success: {
                readonly foreground: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly accent: Readonly<{
                    source: "accent";
                    key: "success";
                    alpha?: number;
                }>;
                readonly mark: "success";
            };
            readonly warning: {
                readonly foreground: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly accent: Readonly<{
                    source: "accent";
                    key: "warning";
                    alpha?: number;
                }>;
                readonly mark: "warning";
            };
            readonly danger: {
                readonly foreground: Readonly<{
                    source: "theme";
                    key: "text";
                    alpha?: number;
                }>;
                readonly accent: Readonly<{
                    source: "theme";
                    key: "danger";
                    alpha?: number;
                }>;
                readonly mark: "alert";
            };
        };
        readonly surface: {
            readonly background: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
            readonly borderWidth: 1;
            readonly radius: "md";
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
            readonly minHeight: 56;
            readonly padding: 16;
            readonly gap: 12;
            readonly maxWidth: 420;
        };
        readonly toneMark: {
            readonly width: 2;
            readonly radius: "full";
        };
        readonly icon: {
            readonly glyph: "sm";
        };
        readonly content: {
            readonly gap: 4;
        };
        readonly title: {
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly fontWeight: "700";
        };
        readonly description: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly action: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly fontWeight: "700";
            readonly minHeight: 44;
            readonly paddingHorizontal: 8;
        };
        readonly close: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly diameter: 44;
            readonly glyph: "xs";
        };
        readonly states: {
            readonly pressedOpacity: 0.86;
            readonly draggedOpacity: 0.64;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
        };
        readonly gesture: {
            readonly dismissThreshold: 50;
        };
        readonly transition: {
            readonly web: {
                readonly enter: {
                    readonly duration: 120;
                    readonly easing: "standard";
                    readonly reducedMotion: "instant";
                };
                readonly exit: {
                    readonly duration: 120;
                    readonly easing: "exit";
                    readonly reducedMotion: "instant";
                };
            };
            readonly native: {
                readonly enter: {
                    readonly duration: 200;
                    readonly easing: "enter";
                    readonly reducedMotion: "opacity";
                };
                readonly exit: {
                    readonly duration: 120;
                    readonly easing: "exit";
                    readonly reducedMotion: "instant";
                };
            };
        };
    };
    readonly tooltipRecipe: {
        readonly slots: readonly ["provider", "trigger", "content", "arrow"];
        readonly defaults: {
            readonly placement: "top";
            readonly align: "center";
        };
        readonly layer: 950;
        readonly surface: {
            readonly background: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly radius: "sm";
            readonly padding: 8;
            readonly borderWidth: 1;
            readonly shadow: {
                readonly color: "#000000";
                readonly opacity: 0.12;
                readonly radius: 12;
                readonly offsetY: 4;
            };
        };
        readonly content: {
            readonly color: Readonly<{
                source: "theme";
                key: "bg";
                alpha?: number;
            }>;
            readonly textVariant: "label";
            readonly maxWidth: 280;
        };
        readonly arrow: {
            readonly width: 10;
            readonly height: 5;
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly padding: 8;
        };
        readonly positioning: {
            readonly sideOffset: 4;
            readonly collisionPadding: 12;
        };
        readonly transition: {
            readonly enter: {
                readonly duration: 120;
                readonly easing: "standard";
                readonly reducedMotion: "instant";
            };
            readonly exit: {
                readonly duration: 120;
                readonly easing: "exit";
                readonly reducedMotion: "instant";
            };
        };
    };
    readonly topBarRecipe: {
        readonly slots: readonly ["root", "leading", "title", "trailing"];
        readonly defaults: {
            readonly centered: true;
        };
        readonly minHeight: 52;
        readonly sideMinWidth: 44;
        readonly paddingHorizontal: 16;
        readonly title: {
            readonly textVariant: "bodyLarge";
            readonly color: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly fontWeight: "700";
        };
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
    };
    readonly treeRecipe: {
        readonly slots: readonly ["root", "node", "toggle", "indent", "label", "description"];
        readonly indentPerLevel: 20;
        readonly node: {
            readonly minHeight: 44;
            readonly paddingHorizontal: 12;
            readonly gap: 12;
            readonly radius: "md";
            readonly label: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textBody";
                    alpha?: number;
                }>;
                readonly textVariant: "body";
            };
            readonly description: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "textMuted";
                    alpha?: number;
                }>;
                readonly textVariant: "label";
            };
            readonly highlightedBackground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly selectedBackground: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly selectedIndicator: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly danger: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly toggle: {
            readonly size: "sm";
            readonly icons: {
                readonly collapsed: "chevronEnd";
                readonly expanded: "chevronDown";
            };
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly hitTarget: 44;
        };
    };
    readonly uploadItemRecipe: {
        readonly slots: readonly ["root", "icon", "name", "meta", "progress", "statusText", "cancel", "retry"];
        readonly defaults: {
            readonly size: "medium";
        };
        readonly row: {
            readonly minHeight: 68;
            readonly paddingHorizontal: 16;
            readonly gap: 12;
            readonly radius: "md";
        };
        readonly name: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
        };
        readonly meta: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly statusTones: {
            readonly pending: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly uploading: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly success: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly error: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly progress: {
            readonly size: "medium";
            readonly tone: "brand";
            readonly errorTone: "danger";
        };
        readonly action: {
            readonly minTarget: 44;
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly dangerColor: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly states: {
            readonly focus: {
                readonly color: Readonly<{
                    source: "theme";
                    key: "contentBrand";
                    alpha?: number;
                }>;
                readonly width: 2;
                readonly offset: 2;
            };
            readonly disabledOpacity: 0.5;
        };
    };
};
export type RecipeName = keyof typeof recipeRegistry;
//# sourceMappingURL=catalog.d.ts.map