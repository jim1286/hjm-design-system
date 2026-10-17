"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { resolveFollowProposal, resolveAttendanceProposal } from "@hjmds/design-contracts/social-compositions";
import { Button } from "./actions.js";
import { AnimatedStatistic } from "./statistic-motion.js";
import { Avatar } from "./advanced-display.js";
import { Card } from "./display.js";
import { Stack, Text } from "./layout.js";
import { RadioGroup } from "./selection.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
function Failure({ failed, label }) {
    return failed ? _jsx(Text, { role: "alert", style: { textAlign: "center" }, tone: "danger", children: label }) : null;
}
export function FollowProfileCard(props) {
    if (!props.profileId.trim())
        throw new TypeError("Follow profile requires a stable id");
    return _jsx(FollowProfileBody, { ...props }, props.profileId);
}
function FollowProfileBody(props) {
    resolveFollowProposal(props.state, props.state.following);
    const action = useCompositionAction(props.disabled);
    // Capture the proposal once; changing server counts during the request must not add the delta twice.
    const displayed = action.active ?? props.state;
    return _jsx(Card, { title: props.name, description: props.description, leading: props.avatar ?? _jsx(Avatar, { name: props.name, "aria-hidden": true }), children: _jsxs(Stack, { gap: "md", children: [_jsx(AnimatedStatistic, { descriptor: { id: "social-count", label: props.labels.count }, value: displayed.count, locale: props.locale }), _jsx(Button, { selected: displayed.following, loading: action.pending, "aria-label": action.pending ? props.labels.pending : undefined, disabled: props.disabled === true, onClick: () => { const proposal = resolveFollowProposal(props.state, !props.state.following); void action.run(proposal, () => props.onFollowChange(proposal.following)); }, children: displayed.following ? props.labels.following : props.labels.follow }), _jsx(Failure, { failed: action.failed, label: props.labels.error })] }) });
}
export function EventAttendanceCard(props) {
    if (!props.eventId.trim())
        throw new TypeError("Event attendance requires a stable id");
    return _jsx(EventAttendanceBody, { ...props }, props.eventId);
}
function EventAttendanceBody(props) {
    resolveAttendanceProposal(props.state, props.choices, props.state.responseId);
    const action = useCompositionAction(props.disabled), [calendarAdded, setCalendarAdded] = useState(false);
    const displayed = action.active === null || action.active === "calendar" ? props.state : action.active;
    const locked = props.disabled === true || action.pending;
    return _jsx(Card, { title: props.title, description: props.description, children: _jsxs(Stack, { gap: "md", children: [_jsx(Text, { children: props.dateLabel }), _jsx(AnimatedStatistic, { descriptor: { id: "social-count", label: props.labels.count }, value: displayed.count, locale: props.locale }), _jsx(Stack, { axis: "inline", gap: "xs", wrap: true, children: props.participants.map(person => _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", children: [person.avatar ?? _jsx(Avatar, { name: person.name, "aria-hidden": true }), _jsx(Text, { children: person.name })] }, person.id)) }), _jsx(RadioGroup, { label: props.labels.response, orientation: "horizontal", presentation: "plain", value: displayed.responseId, items: props.choices.map(choice => ({ value: choice.id, label: choice.label, ...(choice.disabled ? { disabled: true } : {}) })), disabled: locked, ...(action.pending && action.active !== "calendar" ? { description: props.labels.pending } : {}), onValueChange: id => { const choice = props.choices.find(item => item.id === id); if (!choice || choice.disabled || choice.id === props.state.responseId || locked)
                        return; const proposal = resolveAttendanceProposal(props.state, props.choices, choice.id); void action.run(proposal, () => props.onResponseChange(choice.id)); } }), _jsx(Button, { tone: "secondary", disabled: locked || calendarAdded, loading: action.active === "calendar", "aria-label": action.pending ? props.labels.pending : undefined, onClick: () => { if (calendarAdded)
                        return; void action.run("calendar", props.onAddToCalendar).then(outcome => { if (outcome.status === "success")
                        setCalendarAdded(true); }); }, children: calendarAdded ? props.labels.calendarAdded : props.labels.calendar }), _jsx(Failure, { failed: action.failed, label: props.labels.error })] }) });
}
//# sourceMappingURL=social-compositions.js.map