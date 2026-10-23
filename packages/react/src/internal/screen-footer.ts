"use client";

import { createContext } from "react";

/**
 * Set inside a padded ScreenLayout or Sheet footer. The parent owns the bar chrome and safe area, so
 * BottomCTA placed there renders only its copy and actions; drawing its own bar too doubled the border, inset the
 * buttons twice and (Native) added a shadowed surface inside the footer (2026-10-17 screen review, common-screen-shell).
 */
export const ScreenFooterContext = createContext<Readonly<{ bottomPadding: string }> | null>(null);
