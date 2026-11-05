import { jsx as _jsx } from "react/jsx-runtime";
import { ArrowDown, ArrowLeft, ArrowLeftRight, ArrowRight, ArrowUp, Bell, Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleAlert, CircleCheck, CircleQuestionMark, Copy, Download, Ellipsis, EllipsisVertical, Equal, Eye, EyeOff, Funnel, Heart, House, Info, Lock, LockOpen, Menu, Pause, Pencil, Play, Plus, RefreshCw, RotateCw, Search, Settings, Share2, Sparkles, Trash, TrendingDown, TrendingUp, TriangleAlert, Upload, User, Users, X, } from "lucide-react-native";
import { isSemanticIconName, } from "@hjmds/design-contracts/components/icon";
// Native Icon keeps `renderGlyph` as its tree-shakeable artwork seam; this granular entry opts in to HJM's semantic
// marks. They are Lucide icons (contracts `semanticIconLucideNames` names each one), drawn through the optional peers
// `lucide-react-native` and `react-native-svg`, so core controls still run without either.
export const semanticIconGlyphs = {
    add: Plus,
    ai: Sparkles,
    alert: TriangleAlert,
    arrowDown: ArrowDown,
    arrowUp: ArrowUp,
    back: ArrowLeft,
    calendar: Calendar,
    check: Check,
    chevronDown: ChevronDown,
    chevronEnd: ChevronRight,
    chevronStart: ChevronLeft,
    chevronUp: ChevronUp,
    close: X,
    compare: ArrowLeftRight,
    copy: Copy,
    delete: Trash,
    download: Download,
    edit: Pencil,
    error: CircleAlert,
    favorite: Heart,
    filter: Funnel,
    forward: ArrowRight,
    help: CircleQuestionMark,
    home: House,
    info: Info,
    lock: Lock,
    menu: Menu,
    more: Ellipsis,
    moreVertical: EllipsisVertical,
    notifications: Bell,
    pause: Pause,
    play: Play,
    refresh: RefreshCw,
    rotate: RotateCw,
    search: Search,
    settings: Settings,
    share: Share2,
    success: CircleCheck,
    trendDown: TrendingDown,
    trendFlat: Equal,
    trendUp: TrendingUp,
    unblock: LockOpen,
    upload: Upload,
    user: User,
    users: Users,
    visibility: Eye,
    visibilityOff: EyeOff,
    warning: TriangleAlert,
};
/**
 * Draws an HJM semantic mark inside Icon's frame. Icon still owns naming, size, tone and RTL mirroring; this only
 * paints the Lucide glyph with the resolved size, color and stroke and hides it from assistive technology.
 */
export function renderSemanticGlyph({ name, size, color, strokeWidth }) {
    if (!isSemanticIconName(name))
        throw new TypeError(`No HJM semantic glyph for ${name}`);
    const Glyph = semanticIconGlyphs[name];
    return _jsx(Glyph, { size: size, color: color, strokeWidth: strokeWidth, accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" });
}
//# sourceMappingURL=icon-svg.js.map