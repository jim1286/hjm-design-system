import { useState } from "react";
import { TransferList } from "@hjmds/react/transfer-list";
import { Mentions } from "@hjmds/react/mentions";
import { Button } from "@hjmds/react/actions";
import { List, ListRow } from "@hjmds/react/display";
import { Notice } from "@hjmds/react/feedback";
import { Stack, Section } from "@hjmds/react/layout";
import { mentionsExample as mention, transferListExample as transfer } from "../../../shared/component-examples.js";

export function TransferListPreview() {
  const [target, setTarget] = useState<ReadonlySet<string>>(new Set(transfer.initialTarget));
  const [announcement, setAnnouncement] = useState("");
  const labelOf = (id: string) => transfer.records.find((record) => record.id === id)?.label ?? id;
  return (
    <Section title={transfer.title} description={transfer.description}>
      <Stack gap="md">
        <TransferList
          items={transfer.records}
          targetKeys={target}
          onTargetKeysChange={setTarget}
          onMove={(ids, direction) => setAnnouncement(transfer.moved(ids.map(labelOf), direction))}
          labels={transfer.labels}
        />
        {/* The product owns the sentence; the renderer only reports which ids moved. */}
        <p role="status">{announcement}</p>
      </Stack>
    </Section>
  );
}

export function MentionsPreview() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const candidates = query === null ? [] : mention.people.filter((person) => person.label.startsWith(query));
  return (
    <Section title={mention.title} description={mention.description}>
      <Stack gap="md">
        <Mentions
          label={mention.label}
          description={mention.fieldDescription}
          value={text}
          onValueChange={setText}
          triggers={[{ id: "person", trigger: "@" }]}
          candidates={candidates}
          onMentionQueryChange={(match) => setQuery(match?.query ?? null)}
          emptyMessage={mention.emptyMessage}
          listLabel={mention.listLabel}
        />
        <Button onClick={() => setSaved(text.trim())} disabled={text.trim().length === 0}>{mention.save}</Button>
        {saved ? (
          <List label={mention.savedList}><ListRow title={saved} /></List>
        ) : <Notice title={mention.emptySaved.title} description={mention.emptySaved.description} />}
      </Stack>
    </Section>
  );
}
