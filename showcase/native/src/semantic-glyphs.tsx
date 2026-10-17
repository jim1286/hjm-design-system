import { ArrowRight, CircleCheck, Heart, House, Plus, TriangleAlert, UserRound, X } from "lucide-react-native";
import { createLucideGlyph } from "@hjmds/react-native/icon-lucide";

// Native Icon needs a product glyph renderer (Web ships built-in paths). One map for the component examples keeps the
// semantic names shown on Web (home, success, warning, forward, favorite, close, add, user) instead of letter placeholders.
export const semanticGlyph = createLucideGlyph({ home: House, success: CircleCheck, warning: TriangleAlert, forward: ArrowRight, favorite: Heart, close: X, add: Plus, user: UserRound });
