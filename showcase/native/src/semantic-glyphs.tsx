import { ArrowRight, ChevronDown, ChevronLeft, CircleCheck, CircleHelp, Ellipsis, Heart, House, Plus, SlidersHorizontal, TriangleAlert, UserRound, X } from "lucide-react-native";
import { createLucideGlyph } from "@hjmds/react-native/icon-lucide";

// Native Icon needs a product glyph renderer (Web ships built-in paths). One map for the component examples keeps the
// semantic names shown on Web (home, success, warning, forward, favorite, close, add, user, chevrons, more, help,
// filter) instead of letter placeholders.
export const semanticGlyph = createLucideGlyph({ home: House, success: CircleCheck, warning: TriangleAlert, forward: ArrowRight, favorite: Heart, close: X, add: Plus, user: UserRound, chevronDown: ChevronDown, chevronStart: ChevronLeft, more: Ellipsis, help: CircleHelp, filter: SlidersHorizontal });
