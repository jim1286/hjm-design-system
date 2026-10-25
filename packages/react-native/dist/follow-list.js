"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from "react";
import { View } from "react-native";
import { ScreenLayout } from "./screens.js";
import { Tabs, TabPanel } from "./navigation.js";
import { SearchField } from "./inputs.js";
import { ListRow } from "./data-display.js";
import { Avatar, List } from "./data-display.js";
import { Stack, Text } from "./primitives.js";
import { Button } from "./actions.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
/** Products own queries, pagination, permissions and mutations. HJM owns the two-tab people layout. */
export function FollowListScreen({ tab, labels, people, query, onTabChange, onQueryChange, onOpenProfile, onFollowChange, state, notice, toolbar, searchVisible = true, renderPeople, ...screen }) {
    const tabsId = useId();
    const contentState = (state?.kind ?? "ready") === "ready" && people.length === 0
        ? { kind: "empty", title: labels.empty } : state;
    const renderPerson = (person) => _jsx(FollowPersonRow, { person: person, labels: labels, onOpenProfile: onOpenProfile, onFollowChange: onFollowChange }, person.id);
    return _jsx(ScreenLayout, { ...screen, initialFocus: screen.initialFocus ?? "none", contentInset: "default", ...(contentState ? { state: contentState } : {}), notice: _jsxs(Stack, { gap: "sm", children: [_jsx(Tabs, { id: tabsId, label: labels.tabs, value: tab, onValueChange: value => onTabChange(value), items: [{ id: "followers", label: labels.followers }, { id: "following", label: labels.following }], layout: "fitted", appearance: "standard", indicator: "underline", panelMode: "dynamic", renderPanels: false }), _jsxs(Stack, { gap: "xs", children: [toolbar, searchVisible && _jsx(SearchField, { accessibilityLabel: labels.search, placeholder: labels.search, clearLabel: labels.clearSearch, busyLabel: labels.searching, value: query, onValueChange: onQueryChange })] }), notice] }), children: _jsx(TabPanel, { layoutStyle: { flex: 1 }, label: labels[tab], tabsId: tabsId, activeValue: tab, mode: "dynamic", children: renderPeople ? renderPeople(people, renderPerson) : _jsx(List, { label: labels[tab], separator: "none", appearance: "plain", children: people.map(renderPerson) }) }) });
}
function FollowPersonRow({ person, labels, onOpenProfile, onFollowChange }) {
    const action = useCompositionAction(person.disabled);
    // Keep the confirmed relationship visible until success; failures never leave a false followed state.
    return _jsxs(Stack, { gap: "xxs", children: [_jsx(ListRow, { title: person.username, ...(person.name ? { description: person.name } : {}), leadingShape: "circle", leadingSize: "large", density: "comfortable", leading: person.avatar ?? _jsx(Avatar, { size: "large", name: person.name ?? person.username, decorative: true }), onPress: () => onOpenProfile(person.id), trailingAction: _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", children: [(person.message || person.showFollow !== false) && _jsx(View, { style: { width: 108 }, children: person.message ? _jsx(Button, { fullWidth: true, size: "small", tone: "secondary", accessibilityLabel: person.message.accessibilityLabel ?? `${person.username}: ${person.message.label}`, onPress: person.message.onPress, children: person.message.label }) : person.showFollow !== false && _jsx(Button, { fullWidth: true, size: "small", tone: person.following ? "secondary" : "primary", loading: action.pending, loadingLabel: labels.pending, disabled: person.disabled === true, selected: person.following, accessibilityLabel: person.followAccessibilityLabel ?? `${person.username}: ${person.followLabel ?? (person.following ? labels.followed : labels.follow)}`, onPress: () => { void action.run(!person.following, () => onFollowChange(person.id, !person.following)); }, children: person.followLabel ?? (person.following ? labels.followed : labels.follow) }) }), person.action] }) }), action.failed ? _jsx(Text, { accessibilityRole: "alert", tone: "danger", children: labels.failed }) : null] });
}
//# sourceMappingURL=follow-list.js.map