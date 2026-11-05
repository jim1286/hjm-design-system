import { jsx as _jsx } from "react/jsx-runtime";
import ArrowDown from "lucide-react-native/icons/arrow-down";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import ArrowLeftRight from "lucide-react-native/icons/arrow-left-right";
import ArrowRight from "lucide-react-native/icons/arrow-right";
import ArrowUp from "lucide-react-native/icons/arrow-up";
import Bell from "lucide-react-native/icons/bell";
import Calendar from "lucide-react-native/icons/calendar";
import Check from "lucide-react-native/icons/check";
import ChevronDown from "lucide-react-native/icons/chevron-down";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import ChevronUp from "lucide-react-native/icons/chevron-up";
import CircleAlert from "lucide-react-native/icons/circle-alert";
import CircleCheck from "lucide-react-native/icons/circle-check";
import CircleQuestionMark from "lucide-react-native/icons/circle-question-mark";
import Copy from "lucide-react-native/icons/copy";
import Download from "lucide-react-native/icons/download";
import Ellipsis from "lucide-react-native/icons/ellipsis";
import EllipsisVertical from "lucide-react-native/icons/ellipsis-vertical";
import Equal from "lucide-react-native/icons/equal";
import Eye from "lucide-react-native/icons/eye";
import EyeOff from "lucide-react-native/icons/eye-off";
import Funnel from "lucide-react-native/icons/funnel";
import Heart from "lucide-react-native/icons/heart";
import House from "lucide-react-native/icons/house";
import Info from "lucide-react-native/icons/info";
import Lock from "lucide-react-native/icons/lock";
import LockOpen from "lucide-react-native/icons/lock-open";
import Menu from "lucide-react-native/icons/menu";
import Pause from "lucide-react-native/icons/pause";
import Pencil from "lucide-react-native/icons/pencil";
import Play from "lucide-react-native/icons/play";
import Plus from "lucide-react-native/icons/plus";
import RefreshCw from "lucide-react-native/icons/refresh-cw";
import RotateCw from "lucide-react-native/icons/rotate-cw";
import Search from "lucide-react-native/icons/search";
import Settings from "lucide-react-native/icons/settings";
import Share2 from "lucide-react-native/icons/share-2";
import Sparkles from "lucide-react-native/icons/sparkles";
import Trash from "lucide-react-native/icons/trash";
import TrendingDown from "lucide-react-native/icons/trending-down";
import TrendingUp from "lucide-react-native/icons/trending-up";
import TriangleAlert from "lucide-react-native/icons/triangle-alert";
import Upload from "lucide-react-native/icons/upload";
import User from "lucide-react-native/icons/user";
import Users from "lucide-react-native/icons/users";
import X from "lucide-react-native/icons/x";
import { isSemanticIconName, } from "@hjmds/design-contracts/components/icon";
// Native Icon keeps `renderGlyph` as its tree-shakeable artwork seam; this granular entry opts in to HJM's semantic
// marks. They are Lucide icons (contracts `semanticIconLucideNames` names each one). Lucide is the only icon source
// (user instruction 2026-11-05), so `lucide-react-native` and `react-native-svg` are required peers that core controls
// also draw their built-in marks with (internal/lucide-glyph). Each icon is imported from its own file because Metro does
// not tree-shake the package barrel, which pulled every Lucide icon into this entry.
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