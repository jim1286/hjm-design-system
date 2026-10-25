"use client";
import { useId, type ReactNode } from "react";
import { View } from "react-native";
import { ScreenLayout, type ScreenLayoutProps } from "./screens.js";
import { Tabs, TabPanel } from "./navigation.js";
import { SearchField } from "./inputs.js";
import { ListRow } from "./data-display.js";
import { Avatar, List } from "./data-display.js";
import { Stack, Text } from "./primitives.js";
import { Button } from "./actions.js";
import { useCompositionAction } from "./internal/use-composition-action.js";

export type FollowListPerson = Readonly<{
  id: string; username: string; name?: string; avatar?: ReactNode;
  following: boolean; disabled?: boolean;
  /** Hide for self/unknown relationships; products decide permission and ownership. */
  showFollow?: boolean; followLabel?: string; followAccessibilityLabel?: string;
  /** Product-owned extra action, such as confirmed removal from my followers. */
  action?: ReactNode;
  /** A confirmed relationship can offer messaging without toggling follow. */
  message?: Readonly<{ label: string; accessibilityLabel?: string; onPress(): void }>;
}>;
export type FollowListScreenProps = Omit<ScreenLayoutProps, "children" | "notice" | "contentInset"> & Readonly<{
  tab: "followers" | "following";
  /** Complete localized tab labels, including server-confirmed counts. */
  labels: Readonly<{ followers: string; following: string; tabs: string; search: string;
    clearSearch: string; searching: string; empty: string; follow: string; followed: string;
    pending: string; failed: string }>;
  people: readonly FollowListPerson[];
  query: string;
  notice?: ReactNode;
  /** Product sorting and search controls, between tabs and the optional search field. */
  toolbar?: ReactNode;
  searchVisible?: boolean;
  /** Virtualized hosts use scroll="content" and retain HJM's row layout and action scope. */
  renderPeople?: (people: readonly FollowListPerson[], renderPerson: (person: FollowListPerson) => ReactNode) => ReactNode;
  onTabChange(tab: "followers" | "following"): void;
  onQueryChange(query: string): void;
  onOpenProfile(id: string): void;
  /** Resolve after updating people with the server-confirmed state; reject on failure. */
  onFollowChange(id: string, following: boolean): void | Promise<void>;
}>;

/** Products own queries, pagination, permissions and mutations. HJM owns the two-tab people layout. */
export function FollowListScreen({ tab, labels, people, query, onTabChange, onQueryChange, onOpenProfile, onFollowChange, state, notice, toolbar, searchVisible = true, renderPeople, ...screen }: FollowListScreenProps) {
  const tabsId = useId();
  const contentState = (state?.kind ?? "ready") === "ready" && people.length === 0
    ? { kind: "empty" as const, title: labels.empty } : state;
  const renderPerson = (person: FollowListPerson) => <FollowPersonRow key={person.id} person={person} labels={labels}
    onOpenProfile={onOpenProfile} onFollowChange={onFollowChange} />;
  return <ScreenLayout {...screen} initialFocus={screen.initialFocus ?? "none"} contentInset="default"
    {...(contentState ? { state: contentState } : {})}
    notice={<Stack gap="sm">
      <Tabs id={tabsId} label={labels.tabs} value={tab} onValueChange={value => onTabChange(value as "followers" | "following")}
        items={[{ id: "followers", label: labels.followers }, { id: "following", label: labels.following }]}
        layout="fitted" appearance="standard" indicator="underline" panelMode="dynamic" renderPanels={false} />
      <Stack gap="xs">
      {toolbar}
      {searchVisible && <SearchField accessibilityLabel={labels.search} placeholder={labels.search} clearLabel={labels.clearSearch} busyLabel={labels.searching}
        value={query} onValueChange={onQueryChange} />}
      </Stack>
      {notice}
    </Stack>}>
    <TabPanel layoutStyle={{ flex: 1 }} label={labels[tab]} tabsId={tabsId} activeValue={tab} mode="dynamic">
      {renderPeople ? renderPeople(people, renderPerson) : <List label={labels[tab]} separator="none" appearance="plain">
        {people.map(renderPerson)}
      </List>}
    </TabPanel>
  </ScreenLayout>;
}

function FollowPersonRow({ person, labels, onOpenProfile, onFollowChange }: Pick<FollowListScreenProps, "labels" | "onOpenProfile" | "onFollowChange"> & { person: FollowListPerson }) {
  const action = useCompositionAction<boolean>(person.disabled);
  // Keep the confirmed relationship visible until success; failures never leave a false followed state.
  return <Stack gap="xxs">
    <ListRow title={person.username} {...(person.name ? { description: person.name } : {})} leadingShape="circle" leadingSize="large" density="comfortable"
      leading={person.avatar ?? <Avatar size="large" name={person.name ?? person.username} decorative />}
      onPress={() => onOpenProfile(person.id)}
      trailingAction={<Stack axis="inline" gap="xs" align="center">{(person.message || person.showFollow !== false) && <View style={{ width: 108 }}>{person.message ? <Button fullWidth size="small" tone="secondary"
        accessibilityLabel={person.message.accessibilityLabel ?? `${person.username}: ${person.message.label}`}
        onPress={person.message.onPress} >
        {person.message.label}
      </Button> : person.showFollow !== false && <Button fullWidth size="small" tone={person.following ? "secondary" : "primary"}
        loading={action.pending} loadingLabel={labels.pending} disabled={person.disabled === true}
        selected={person.following}
        accessibilityLabel={person.followAccessibilityLabel ?? `${person.username}: ${person.followLabel ?? (person.following ? labels.followed : labels.follow)}`}
        onPress={() => { void action.run(!person.following, () => onFollowChange(person.id, !person.following)); }}>
        {person.followLabel ?? (person.following ? labels.followed : labels.follow)}
      </Button>}</View>}{person.action}</Stack>} />
    {action.failed ? <Text accessibilityRole="alert" tone="danger">{labels.failed}</Text> : null}
  </Stack>;
}
