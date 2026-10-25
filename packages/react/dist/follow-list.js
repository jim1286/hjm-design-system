"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from "react";
import { ScreenLayout } from "./screens.js";
import { Tabs, TabPanel } from "./navigation.js";
import { SearchField } from "./forms.js";
import { ListRow } from "./display.js";
import { Avatar, List } from "./advanced-display.js";
import { Stack, Text } from "./layout.js";
import { Button } from "./actions.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
/** Products own queries, pagination, permissions and mutations. HJM owns the two-tab people layout. */
export function FollowListScreen({ tab, labels, people, query, onTabChange, onQueryChange, onOpenProfile, onFollowChange, state, notice, toolbar, searchVisible = true, renderPeople, ...screen }) {
    const tabsId = useId();
    const contentState = (state?.kind ?? "ready") === "ready" && people.length === 0
        ? { kind: "empty", title: labels.empty } : state;
    const renderPerson = (person) => _jsx(FollowPersonRow, { person: person, labels: labels, onOpenProfile: onOpenProfile, onFollowChange: onFollowChange }, person.id);
    return _jsx(ScreenLayout, { ...screen, initialFocus: screen.initialFocus ?? "none", contentInset: "default", ...(contentState ? { state: contentState } : {}), notice: _jsxs(Stack, { gap: "sm", children: [_jsx(Tabs, { id: tabsId, label: labels.tabs, value: tab, onValueChange: value => onTabChange(value), items: [{ id: "followers", label: labels.followers }, { id: "following", label: labels.following }], layout: "fitted", appearance: "standard", indicator: "underline", panelMode: "dynamic", renderPanels: false }), _jsxs(Stack, { gap: "xs", children: [toolbar, searchVisible && _jsx(SearchField, { "aria-label": labels.search, placeholder: labels.search, clearLabel: labels.clearSearch, value: query, onValueChange: onQueryChange })] }), notice] }), children: _jsx(TabPanel, { className: "hjm-follow-list__panel", tabsId: tabsId, activeValue: tab, mode: "dynamic", children: renderPeople ? renderPeople(people, renderPerson) : _jsx(List, { label: labels[tab], separator: "none", appearance: "plain", children: people.map(renderPerson) }) }) });
}
function FollowPersonRow({ person, labels, onOpenProfile, onFollowChange }) {
    const action = useCompositionAction(person.disabled);
    // Keep the confirmed relationship visible until success; failures never leave a false followed state.
    return _jsxs(Stack, { gap: "xxs", children: [_jsx(ListRow, { className: "hjm-follow-list__person", title: person.username, ...(person.name ? { description: person.name } : {}), leadingShape: "circle", leadingSize: "large", density: "comfortable", leading: person.avatar ?? _jsx(Avatar, { size: "large", name: person.name ?? person.username, "aria-hidden": true }), ...(person.href ? { href: person.href, ...(person.renderLink ? { renderLink: person.renderLink } : {}) } : { onClick: () => onOpenProfile(person.id) }), trailingAction: _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", children: [person.message ? _jsx(Button, { size: "small", tone: "secondary", "aria-label": person.message.accessibilityLabel ?? `${person.username}: ${person.message.label}`, onClick: person.message.onPress, className: "hjm-follow-list__relationship", children: person.message.label }) : person.showFollow !== false && _jsx(Button, { className: "hjm-follow-list__relationship", size: "small", tone: person.following ? "secondary" : "primary", loading: action.pending, disabled: person.disabled === true, "aria-pressed": person.following, "aria-label": action.pending ? `${person.username}: ${labels.pending}` : person.followAccessibilityLabel ?? `${person.username}: ${person.followLabel ?? (person.following ? labels.followed : labels.follow)}`, onClick: () => { void action.run(!person.following, () => onFollowChange(person.id, !person.following)); }, children: person.followLabel ?? (person.following ? labels.followed : labels.follow) }), person.action] }) }), action.failed ? _jsx(Text, { role: "alert", tone: "danger", children: labels.failed }) : null] });
}
//# sourceMappingURL=follow-list.js.map