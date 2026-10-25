"use client";
import { useId, type ReactNode } from "react";
import { ScreenLayout, type ScreenLayoutProps } from "./screens.js";
import { Tabs, TabPanel } from "./navigation.js";
import { SearchField } from "./forms.js";
import { ListRow, type ListRowProps } from "./display.js";
import { Avatar, List } from "./advanced-display.js";
import { Stack, Text } from "./layout.js";
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
  href?: string; renderLink?: ListRowProps["renderLink"];
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
      {searchVisible && <SearchField aria-label={labels.search} placeholder={labels.search} clearLabel={labels.clearSearch}
        value={query} onValueChange={onQueryChange} />}
      </Stack>
      {notice}
    </Stack>}>
    <TabPanel className="hjm-follow-list__panel" tabsId={tabsId} activeValue={tab} mode="dynamic">
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
    <ListRow className="hjm-follow-list__person" title={person.username} {...(person.name ? { description: person.name } : {})} leadingShape="circle" leadingSize="large" density="comfortable"
      leading={person.avatar ?? <Avatar size="large" name={person.name ?? person.username} aria-hidden />}
      {...(person.href ? { href: person.href, ...(person.renderLink ? { renderLink: person.renderLink } : {}) } : { onClick: () => onOpenProfile(person.id) })}
      trailingAction={<Stack axis="inline" gap="xs" align="center">{person.message ? <Button size="small" tone="secondary"
        aria-label={person.message.accessibilityLabel ?? `${person.username}: ${person.message.label}`}
        onClick={person.message.onPress} className="hjm-follow-list__relationship">
        {person.message.label}
      </Button> : person.showFollow !== false && <Button className="hjm-follow-list__relationship" size="small" tone={person.following ? "secondary" : "primary"}
        loading={action.pending} disabled={person.disabled === true}
        aria-pressed={person.following}
        aria-label={action.pending ? `${person.username}: ${labels.pending}` : person.followAccessibilityLabel ?? `${person.username}: ${person.followLabel ?? (person.following ? labels.followed : labels.follow)}`}
        onClick={() => { void action.run(!person.following, () => onFollowChange(person.id, !person.following)); }}>
        {person.followLabel ?? (person.following ? labels.followed : labels.follow)}
      </Button>}{person.action}</Stack>} />
    {action.failed ? <Text role="alert" tone="danger">{labels.failed}</Text> : null}
  </Stack>;
}
