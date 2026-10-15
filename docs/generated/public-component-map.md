# HJM 공개 컴포넌트와 카탈로그 대응표

카탈로그는 의미 계약, package exports는 실제 사용 가능한 API다. 2026-10-01 중복 조사에서 TextField와 Table 등 공개 이름이 카탈로그 밖이라 전체 범위를 놓칠 수 있음을 확인해 이 대응표를 추가했다. source와 manifest에서 생성하며 새로운 미분류 공개 이름은 검사에서 실패한다. 표의 역할은 stable 성숙도나 기기 검증을 뜻하지 않는다.

## @hjmds/react

고유 공개 컴포넌트 및 provider 이름 203개. 재노출된 이름은 한 번만 센다.

| 공개 API | 계약 | 역할 | import 경로 |
| --- | --- | --- | --- |
| Accordion | Accordion | canonical | root, ./display |
| AccountSwitcher | 별도 보조 기능 | supplemental | ./task-controls |
| ActivityChip | 별도 보조 기능 | supplemental | ./activity-chip, ./feedback |
| ActivityHeatmap | 별도 보조 기능 | supplemental | ./activity-heatmap |
| Affix | Affix | canonical | ./affix |
| Agreement | Agreement | canonical | root, ./agreement |
| AlertDialog | AlertDialog | canonical | root, ./overlays |
| Anchor | Anchor | canonical | root, ./anchor |
| AnimatedStatistic | Statistic | optional-extension | ./statistic-motion |
| AspectRatio | AspectRatio | canonical | root, ./layout |
| Asset | Asset | canonical | root, ./asset |
| AssetGroup | Asset | companion-or-alternative | root, ./asset |
| AuthProviderButton | AuthProviderButton | canonical | root, ./provider-button |
| AuthScreenLayout | AuthScreenLayout | canonical | root, ./auth-screen |
| Avatar | Avatar | canonical | root, ./display |
| AvatarGroup | Avatar | companion-or-alternative | root, ./display |
| Badge | Badge | canonical | root, ./display |
| BarChart | Chart | companion-or-alternative | ./chart |
| BezierEditor | 별도 보조 기능 | supplemental | ./authoring-tools |
| BottomCTA | BottomCTA | canonical | root, ./bottom-cta |
| BottomInfo | BottomInfo | canonical | root, ./bottom-info |
| BottomNavigation | BottomNavigation | canonical | root, ./navigation |
| Breadcrumb | Breadcrumb | canonical | root, ./breadcrumb, ./navigation |
| Button | Button | canonical | root, ./actions |
| Calendar | Calendar | canonical | root, ./calendar |
| Card | Card | canonical | root, ./display |
| Carousel | Carousel | canonical | root, ./carousel |
| CarouselMotion | Carousel | optional-extension | ./carousel-motion |
| Celebration | 별도 보조 기능 | supplemental | ./celebration |
| ChartLegend | Chart | companion-or-alternative | ./chart |
| ChatMessage | 별도 보조 기능 | supplemental | ./screens |
| ChatScreen | 별도 보조 기능 | supplemental | ./screens |
| Checkbox | Checkbox | canonical | root, ./selection |
| CheckboxGroup | CheckboxGroup | canonical | root, ./selection |
| Chip | Chip | canonical | root, ./selection |
| ClipboardButton | Button | companion-or-alternative | root, ./clipboard |
| CodeBlock | 별도 보조 기능 | supplemental | ./code-block |
| CohortRetentionTable | 별도 보조 기능 | supplemental | ./data-workflows |
| Collapsible | Collapsible | canonical | root, ./collapsible |
| CollectionRail | List | companion-or-alternative | ./collection-rail |
| ColorPicker | ColorPicker | canonical | ./color-picker |
| Combobox | Combobox | canonical | root, ./forms |
| CommandPalette | CommandPalette | canonical | root, ./command-palette |
| CommentThreadRow | 별도 보조 기능 | supplemental | ./screen-flows |
| CommentThreadScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| ComparisonTable | DataTable | companion-or-alternative | ./data-table |
| CompositionLayout | 별도 보조 기능 | supplemental | ./screens |
| Container | Container | canonical | root, ./layout |
| ContentTransition | 별도 보조 기능 | supplemental | ./content-transition |
| ContextMenu | ContextMenu | canonical | root, ./context-menu |
| ConversationRow | 별도 보조 기능 | supplemental | ./conversation-row |
| ConversionFunnel | 별도 보조 기능 | supplemental | ./data-workflows |
| CorrelationMatrix | 별도 보조 기능 | supplemental | ./data-workflows |
| CounterBadge | CounterBadge | canonical | root, ./display |
| DataTable | DataTable | canonical | root, ./data-table |
| DateEntry | Field | optional-extension | ./date-entry |
| DatePicker | DatePicker | canonical | root, ./date-picker, ./forms |
| DateRangePicker | DateRangePicker | canonical | root, ./date-range |
| DescriptionList | DescriptionList | canonical | root, ./display |
| Dialog | Dialog | canonical | root, ./overlays |
| Divider | Divider | canonical | root, ./display |
| DocumentResource | Card | optional-extension | ./document-resource |
| DurationField | NumberField | optional-extension | ./duration-field |
| EditorScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| EffectSurface | 별도 보조 기능 | supplemental | ./effect-surface |
| EmptyState | EmptyState | canonical | root, ./feedback |
| EventAttendanceCard | 별도 보조 기능 | supplemental | ./social-compositions |
| ExpandableSearch | 별도 보조 기능 | supplemental | ./communication |
| Field | Field | canonical | root, ./forms |
| FieldGroup | Field | optional-extension | ./field-group |
| FilePicker | FilePicker | canonical | root, ./file-picker, ./forms |
| FilterRecovery | 별도 보조 기능 | supplemental | ./collection-editing |
| FloatingActionButton | FloatingActionButton | canonical | root, ./floating-action-button |
| FolderPreview | Collapsible | optional-extension | ./folder-preview |
| FollowProfileCard | 별도 보조 기능 | supplemental | ./social-compositions |
| Form | Form | canonical | root, ./forms |
| GravityLetters | Text | optional-extension | ./gravity-letters |
| Grid | Grid | canonical | root, ./layout |
| GridReveal | Image | optional-extension | ./grid-reveal |
| Heading | Heading | canonical | root, ./heading |
| HistogramExplorer | 별도 보조 기능 | supplemental | ./data-workflows |
| HjmProvider | DesignSystemProvider | canonical | root, ./provider |
| Icon | Icon | canonical | root, ./display |
| IconButton | IconButton | canonical | root, ./actions |
| Image | Image | canonical | root, ./display |
| ImageComparison | 별도 보조 기능 | supplemental | ./image-comparison |
| ImportFieldMapping | 별도 보조 기능 | supplemental | ./data-workflows |
| InlineConfirm | Button | optional-extension | ./inline-confirm |
| InlineEdit | 별도 보조 기능 | supplemental | ./collection-editing |
| Layout | Layout | canonical | root, ./layout |
| LineChart | Chart | companion-or-alternative | ./chart |
| LineScore | DataTable | companion-or-alternative | ./data-table |
| Link | Link | canonical | root, ./actions |
| List | List | canonical | root, ./display |
| ListDetailScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| ListRow | ListRow | canonical | root, ./display |
| LoadMore | LoadMore | canonical | root, ./navigation |
| Masonry | Masonry | canonical | ./masonry |
| MatrixTable | DataTable | companion-or-alternative | ./data-table |
| MediaSelectionScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| MediaTransport | 별도 보조 기능 | supplemental | ./media-transport |
| Mentions | Mentions | canonical | root, ./mentions |
| Menu | Menu | canonical | root, ./overlays |
| Menubar | Menubar | canonical | root, ./menubar |
| MessageComposer | 별도 보조 기능 | supplemental | ./screens |
| ModerationScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| MorphingMenu | Menu | optional-extension | ./menu-morph |
| NativeSelect | Select | companion-or-alternative | root, ./forms |
| NavigationBar | TopBar | companion-or-alternative | ./navigation-bar |
| Notice | Notice | canonical | root, ./feedback |
| NotificationBell | IconButton | optional-extension | ./notification-bell |
| NotificationInboxScreen | 별도 보조 기능 | supplemental | ./screens |
| NotificationItem | 별도 보조 기능 | supplemental | ./screens |
| NumberField | NumberField | canonical | root, ./forms, ./number-field |
| OnboardingScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| OtpField | OtpField | canonical | root, ./forms, ./otp-field |
| OverlayStackProvider | Dialog | companion-or-alternative | root, ./overlay-stack |
| OverviewScreen | 별도 보조 기능 | supplemental | ./design-profile |
| Pagination | Pagination | canonical | root, ./navigation, ./pagination |
| PasswordField | PasswordField | canonical | root, ./forms, ./password-field |
| PasswordRulesField | 별도 보조 기능 | supplemental | ./task-controls |
| PermissionScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| PhotoSourceSheet | 별도 보조 기능 | supplemental | ./screen-flows |
| PieChart | Chart | companion-or-alternative | ./chart |
| Popover | Popover | canonical | root, ./popover |
| PricingChoice | 별도 보조 기능 | supplemental | ./task-controls |
| ProfileScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| Progress | Progress | canonical | root, ./feedback |
| ProgressiveBlur | 별도 보조 기능 | supplemental | ./progressive-blur |
| QRCode | QRCode | canonical | ./qr-code |
| RadarChart | Chart | companion-or-alternative | ./chart |
| Radio | Radio | canonical | root, ./selection |
| RadioGroup | RadioGroup | canonical | root, ./selection |
| Rating | 별도 보조 기능 | supplemental | ./rating |
| ReactionPicker | Button | optional-extension | ./reaction-picker |
| RepeatableFieldGroup | 별도 보조 기능 | supplemental | ./collection-editing |
| ReplyComposer | 별도 보조 기능 | supplemental | ./communication |
| ReplyMessage | 별도 보조 기능 | supplemental | ./communication |
| Result | Result | canonical | root, ./feedback |
| SavedItemsScreen | 별도 보조 기능 | supplemental | ./saved-items |
| ScatterChart | Chart | companion-or-alternative | ./chart |
| ScreenLayout | 별도 보조 기능 | supplemental | ./screens |
| ScrollProgress | Progress | optional-extension | ./scroll-progress |
| SearchField | SearchField | canonical | root, ./forms |
| SearchScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| Section | Section | canonical | root, ./layout |
| SegmentedControl | SegmentedControl | canonical | root, ./selection |
| Select | Select | canonical | root, ./forms |
| SelectionActionBar | 별도 보조 기능 | supplemental | ./collection-editing |
| SettingsScreen | 별도 보조 기능 | supplemental | ./screens |
| Sheet | Sheet | canonical | root, ./overlays |
| ShortcutRecorder | 별도 보조 기능 | supplemental | ./authoring-tools |
| Sidebar | Sidebar | canonical | root, ./sidebar |
| SidePanel | SidePanel | canonical | root, ./side-panel |
| Skeleton | Skeleton | canonical | root, ./feedback |
| SkipNav | SkipNav | canonical | root, ./skip-nav |
| Slider | Slider | canonical | root, ./forms, ./slider |
| SortableCollection | 별도 보조 기능 | supplemental | ./sortable |
| Sparkline | Chart | companion-or-alternative | ./chart |
| Spinner | Spinner | canonical | root, ./feedback |
| SplitAction | 별도 보조 기능 | supplemental | ./task-controls |
| Splitter | Splitter | canonical | root, ./splitter |
| Stack | Stack | canonical | root, ./layout |
| Statistic | Statistic | canonical | root, ./display |
| StatisticGroup | Statistic | companion-or-alternative | root, ./display |
| StatusText | Text | companion-or-alternative | root, ./status-text |
| StepPlayer | Steps | optional-extension | ./step-player |
| Steps | Steps | canonical | root, ./navigation, ./steps |
| StreamingAnswer | 별도 보조 기능 | supplemental | ./streaming-answer |
| Surface | Surface | canonical | root, ./layout |
| SwipeActions | 별도 보조 기능 | supplemental | ./swipe-actions |
| Switch | Switch | canonical | root, ./selection |
| Table | DataTable | companion-or-alternative | root, ./display |
| TableColumnSettings | 별도 보조 기능 | supplemental | ./collection-editing |
| TabPanel | Tabs | companion-or-alternative | root, ./navigation |
| Tabs | Tabs | canonical | root, ./navigation |
| Tag | Tag | canonical | root, ./display |
| TagsInput | TagsInput | canonical | root, ./tags-input |
| TargetSummary | 별도 보조 기능 | supplemental | ./data-workflows |
| TaskList | List | optional-extension | ./task-list |
| Text | Text | canonical | root, ./layout |
| TextArea | TextArea | canonical | root, ./forms |
| TextField | Field | companion-or-alternative | root, ./forms |
| TextFormat | TextFormat | canonical | root, ./text-formats |
| TextTransition | 별도 보조 기능 | supplemental | ./content-transition |
| ThinkingOrb | ThinkingOrb | canonical | ./thinking-orb |
| Timeline | Timeline | canonical | root, ./display |
| Toast | Toast | canonical | root, ./toast |
| ToastProvider | Toast | companion-or-alternative | root, ./toast |
| ToggleFeedbackButton | 별도 보조 기능 | supplemental | ./toggle-feedback |
| ToggleGroup | ToggleGroup | canonical | root, ./toggle-group |
| Tooltip | Tooltip | canonical | root, ./overlays |
| Top | Top | canonical | root, ./top |
| TopBar | TopBar | canonical | root, ./top-bar |
| Tour | Tour | canonical | root, ./tour |
| TransferList | TransferList | canonical | root, ./transfer-list |
| TransferTask | 별도 보조 기능 | supplemental | ./transfer-task |
| Tree | Tree | canonical | root, ./tree |
| UploadItem | UploadItem | canonical | root, ./display, ./upload-item |
| VirtualList | VirtualList | canonical | ./virtual-list |
| VisuallyHidden | VisuallyHidden | canonical | root, ./layout |
| VoiceNote | Asset | optional-extension | ./voice-note |
| Watermark | Watermark | canonical | ./watermark |

## @hjmds/react-native

고유 공개 컴포넌트 및 provider 이름 189개. 재노출된 이름은 한 번만 센다.

| 공개 API | 계약 | 역할 | import 경로 |
| --- | --- | --- | --- |
| Accordion | Accordion | canonical | root, ./data-display |
| AccountSwitcher | 별도 보조 기능 | supplemental | ./task-controls |
| ActivityChip | 별도 보조 기능 | supplemental | ./activity-chip, ./feedback |
| ActivityHeatmap | 별도 보조 기능 | supplemental | ./activity-heatmap |
| Agreement | Agreement | canonical | root, ./agreement |
| AlertDialog | AlertDialog | canonical | root, ./overlays |
| AnimatedStatistic | Statistic | optional-extension | ./statistic-motion |
| AspectRatio | AspectRatio | canonical | root, ./primitives |
| Asset | Asset | canonical | root, ./asset |
| AssetGroup | Asset | companion-or-alternative | root, ./asset |
| AuthProviderButton | AuthProviderButton | canonical | root, ./provider-button |
| AuthScreenLayout | AuthScreenLayout | canonical | root, ./auth-screen |
| Avatar | Avatar | canonical | root, ./data-display |
| Badge | Badge | canonical | root, ./data-display |
| BarChart | Chart | companion-or-alternative | ./chart |
| BezierEditor | 별도 보조 기능 | supplemental | ./authoring-tools |
| BottomCTA | BottomCTA | canonical | root, ./actions, ./bottom-cta |
| BottomInfo | BottomInfo | canonical | root, ./bottom-info |
| BottomNavigation | BottomNavigation | canonical | root, ./navigation, ./top-bar |
| Button | Button | canonical | root, ./actions, ./bottom-cta |
| Calendar | Calendar | canonical | root, ./calendar |
| Card | Card | canonical | root, ./data-display |
| Carousel | Carousel | canonical | root, ./carousel |
| CarouselMotion | Carousel | optional-extension | ./carousel-motion |
| Celebration | 별도 보조 기능 | supplemental | ./celebration |
| ChartLegend | Chart | companion-or-alternative | ./chart |
| ChatMessage | 별도 보조 기능 | supplemental | ./screens |
| ChatScreen | 별도 보조 기능 | supplemental | ./screens |
| Checkbox | Checkbox | canonical | root, ./inputs |
| CheckboxGroup | CheckboxGroup | canonical | root, ./inputs |
| Chip | Chip | canonical | root, ./inputs |
| CodeBlock | 별도 보조 기능 | supplemental | ./code-block |
| CohortRetentionTable | 별도 보조 기능 | supplemental | ./data-workflows |
| Collapsible | Collapsible | canonical | root, ./collapsible |
| CollectionRail | List | companion-or-alternative | ./collection-rail |
| Combobox | Combobox | canonical | root, ./forms |
| CommentThreadRow | 별도 보조 기능 | supplemental | ./screen-flows |
| CommentThreadScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| ComparisonTable | DataTable | companion-or-alternative | ./data-table |
| CompositionLayout | 별도 보조 기능 | supplemental | ./screens |
| Container | Container | canonical | root, ./primitives |
| ContentTransition | 별도 보조 기능 | supplemental | ./content-transition |
| ConversationRow | 별도 보조 기능 | supplemental | ./conversation-row |
| ConversionFunnel | 별도 보조 기능 | supplemental | ./data-workflows |
| CorrelationMatrix | 별도 보조 기능 | supplemental | ./data-workflows |
| CounterBadge | CounterBadge | canonical | root, ./data-display |
| DataTable | DataTable | canonical | ./data-table |
| DateEntry | Field | optional-extension | ./date-entry |
| DatePicker | DatePicker | canonical | root, ./date-picker, ./inputs |
| DateRangePicker | DateRangePicker | canonical | root, ./date-range |
| DescriptionList | DescriptionList | canonical | root, ./data-display |
| Dialog | Dialog | canonical | root, ./overlays |
| Divider | Divider | canonical | root, ./data-display |
| DocumentResource | Card | optional-extension | ./document-resource |
| DurationField | NumberField | optional-extension | ./duration-field |
| EditorScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| EffectSurface | 별도 보조 기능 | supplemental | ./effect-surface |
| EmptyState | EmptyState | canonical | root, ./feedback |
| EventAttendanceCard | 별도 보조 기능 | supplemental | ./social-compositions |
| ExpandableSearch | 별도 보조 기능 | supplemental | ./communication |
| Field | Field | canonical | root, ./forms |
| FieldGroup | Field | optional-extension | ./field-group |
| FilePicker | FilePicker | canonical | root, ./file-picker, ./inputs |
| FilterRecovery | 별도 보조 기능 | supplemental | ./collection-editing |
| FloatingActionButton | FloatingActionButton | canonical | root, ./floating-action-button |
| FolderPreview | Collapsible | optional-extension | ./folder-preview |
| FollowProfileCard | 별도 보조 기능 | supplemental | ./social-compositions |
| Form | Form | canonical | root, ./forms |
| GestureSheet | Sheet | optional-extension | ./sheet-gesture |
| GestureSheetInput | Field | optional-extension | ./sheet-gesture |
| GestureSheetProvider | Sheet | optional-extension | ./sheet-gesture |
| GravityLetters | Text | optional-extension | ./gravity-letters |
| Grid | Grid | canonical | root, ./primitives |
| GridReveal | Image | optional-extension | ./grid-reveal |
| Heading | Heading | canonical | root, ./heading |
| HistogramExplorer | 별도 보조 기능 | supplemental | ./data-workflows |
| HjmNativeProvider | DesignSystemProvider | canonical | root, ./provider |
| Icon | Icon | canonical | root, ./primitives |
| IconButton | IconButton | canonical | root, ./actions, ./bottom-cta |
| Image | Image | canonical | root, ./data-display |
| ImageComparison | 별도 보조 기능 | supplemental | ./image-comparison |
| ImageViewer | Image | optional-extension | ./image-viewer |
| ImportFieldMapping | 별도 보조 기능 | supplemental | ./data-workflows |
| InlineConfirm | Button | optional-extension | ./inline-confirm |
| InlineEdit | 별도 보조 기능 | supplemental | ./collection-editing |
| KeyboardAvoiding | 별도 보조 기능 | supplemental | root, ./keyboard |
| KeyboardDock | 별도 보조 기능 | supplemental | ./keyboard-controller |
| KeyboardFormScrollView | 별도 보조 기능 | supplemental | ./keyboard-controller |
| KeyboardMotionProvider | 별도 보조 기능 | supplemental | ./keyboard-controller |
| Layout | Layout | canonical | root, ./primitives |
| LineChart | Chart | companion-or-alternative | ./chart |
| LineScore | DataTable | companion-or-alternative | ./data-table |
| Link | Link | canonical | root, ./actions, ./bottom-cta |
| List | List | canonical | root, ./data-display |
| ListDetailScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| ListRow | ListRow | canonical | root, ./data-display |
| LoadMore | LoadMore | canonical | root, ./navigation, ./top-bar |
| Masonry | Masonry | canonical | ./masonry |
| MatrixTable | DataTable | companion-or-alternative | ./data-table |
| MediaSelectionScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| MediaTransport | 별도 보조 기능 | supplemental | ./media-transport |
| Mentions | Mentions | canonical | root, ./mentions |
| Menu | Menu | canonical | root, ./navigation, ./top-bar |
| MessageComposer | 별도 보조 기능 | supplemental | ./screens |
| ModerationScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| NativeContextMenu | ContextMenu | optional-extension | ./context-menu-native |
| NavigationBar | TopBar | companion-or-alternative | ./navigation-bar |
| Notice | Notice | canonical | root, ./feedback |
| NotificationBell | IconButton | optional-extension | ./notification-bell |
| NotificationInboxScreen | 별도 보조 기능 | supplemental | ./screens |
| NotificationItem | 별도 보조 기능 | supplemental | ./screens |
| NumberField | NumberField | canonical | root, ./inputs, ./number-field |
| OnboardingScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| OtpField | OtpField | canonical | root, ./inputs, ./otp-field |
| OverviewScreen | 별도 보조 기능 | supplemental | ./design-profile |
| PasswordField | PasswordField | canonical | root, ./inputs, ./password-field |
| PasswordRulesField | 별도 보조 기능 | supplemental | ./task-controls |
| PermissionScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| PhotoSourceSheet | 별도 보조 기능 | supplemental | ./screen-flows |
| PieChart | Chart | companion-or-alternative | ./chart |
| PricingChoice | 별도 보조 기능 | supplemental | ./task-controls |
| ProfileScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| Progress | Progress | canonical | root, ./feedback |
| ProgressiveBlur | 별도 보조 기능 | supplemental | ./progressive-blur |
| QRCode | QRCode | canonical | ./qr-code |
| RadarChart | Chart | companion-or-alternative | ./chart |
| Radio | Radio | canonical | root, ./inputs |
| RadioGroup | RadioGroup | canonical | root, ./inputs |
| Rating | 별도 보조 기능 | supplemental | ./rating |
| ReactionPicker | Button | optional-extension | ./reaction-picker |
| RepeatableFieldGroup | 별도 보조 기능 | supplemental | ./collection-editing |
| ReplyComposer | 별도 보조 기능 | supplemental | ./communication |
| ReplyMessage | 별도 보조 기능 | supplemental | ./communication |
| Result | Result | canonical | root, ./feedback |
| SavedItemsScreen | 별도 보조 기능 | supplemental | ./saved-items |
| ScatterChart | Chart | companion-or-alternative | ./chart |
| ScreenLayout | 별도 보조 기능 | supplemental | ./screens |
| ScrollProgress | Progress | optional-extension | ./scroll-progress |
| SearchField | SearchField | canonical | root, ./inputs |
| SearchScreen | 별도 보조 기능 | supplemental | ./screen-flows |
| Section | Section | canonical | root, ./primitives |
| SegmentedControl | SegmentedControl | canonical | root, ./inputs |
| Select | Select | canonical | root, ./forms |
| SelectionActionBar | 별도 보조 기능 | supplemental | ./collection-editing |
| SettingsScreen | 별도 보조 기능 | supplemental | ./screens |
| SharedTransitionElement | 별도 보조 기능 | supplemental | ./screen-transition |
| SharedTransitionScreen | 별도 보조 기능 | supplemental | ./screen-transition |
| Sheet | Sheet | canonical | root, ./overlays |
| Skeleton | Skeleton | canonical | root, ./feedback |
| Slider | Slider | canonical | root, ./inputs, ./slider |
| SortableCollection | 별도 보조 기능 | supplemental | ./sortable |
| Sparkline | Chart | companion-or-alternative | ./chart |
| Spinner | Spinner | canonical | root, ./feedback |
| SplitAction | 별도 보조 기능 | supplemental | ./task-controls |
| Stack | Stack | canonical | root, ./primitives |
| Statistic | Statistic | canonical | root, ./data-display |
| StatisticGroup | Statistic | companion-or-alternative | root, ./data-display |
| StatusText | Text | companion-or-alternative | root, ./status-text |
| StepPlayer | Steps | optional-extension | ./step-player |
| Steps | Steps | canonical | root, ./steps |
| StreamingAnswer | 별도 보조 기능 | supplemental | ./streaming-answer |
| Surface | Surface | canonical | root, ./primitives |
| SwipeActions | 별도 보조 기능 | supplemental | ./swipe-actions |
| Switch | Switch | canonical | root, ./inputs |
| TableColumnSettings | 별도 보조 기능 | supplemental | ./collection-editing |
| TabPanel | Tabs | companion-or-alternative | root, ./navigation, ./top-bar |
| Tabs | Tabs | canonical | root, ./navigation, ./top-bar |
| Tag | Tag | canonical | root, ./data-display |
| TagsInput | TagsInput | canonical | root, ./tags-input |
| TargetSummary | 별도 보조 기능 | supplemental | ./data-workflows |
| TaskList | List | optional-extension | ./task-list |
| Text | Text | canonical | root, ./primitives |
| TextArea | TextArea | canonical | root, ./inputs |
| TextField | Field | companion-or-alternative | root, ./inputs |
| TextTransition | 별도 보조 기능 | supplemental | ./content-transition |
| ThinkingOrb | ThinkingOrb | canonical | ./thinking-orb |
| Timeline | Timeline | canonical | root, ./data-display |
| Toast | Toast | canonical | root, ./feedback |
| ToastRegion | Toast | companion-or-alternative | root, ./feedback |
| ToggleFeedbackButton | 별도 보조 기능 | supplemental | ./toggle-feedback |
| ToggleGroup | ToggleGroup | canonical | root, ./toggle-group |
| Top | Top | canonical | root, ./top |
| TopBar | TopBar | canonical | root, ./navigation, ./top-bar |
| TopBarAction | TopBar | companion-or-alternative | root, ./navigation, ./top-bar |
| TransferList | TransferList | canonical | root, ./transfer-list |
| TransferTask | 별도 보조 기능 | supplemental | ./transfer-task |
| UploadItem | UploadItem | canonical | root, ./upload-item |
| VirtualList | VirtualList | canonical | ./virtual-list |
| VoiceNote | Asset | optional-extension | ./voice-note |
