import { useState } from "react";
import { ToggleGroup } from "@hjmds/react/toggle-group";
import { TagsInput } from "@hjmds/react/tags-input";
import { Notice } from "@hjmds/react/feedback";
import { Stack, Section } from "@hjmds/react/layout";
import { tagsInputExample as tags, toggleGroupExample as toggle, toggleGroupStatus } from "../../../shared/component-examples.js";

export function ToggleGroupPreview() {
  const [style, setStyle] = useState<ReadonlySet<string>>(new Set(toggle.style.initial));
  const [filters, setFilters] = useState<ReadonlySet<string>>(new Set());
  return (
    <Section title={toggle.title} description={toggle.description}>
      <Stack gap="md">
        <ToggleGroup descriptor={{ accessibilityLabel: toggle.style.label, items: toggle.style.items }} pressedIds={style} onPressedIdsChange={setStyle} />
        <p role="status">{toggleGroupStatus(style)}</p>
        <ToggleGroup size="small" descriptor={{ accessibilityLabel: toggle.filters.label, items: toggle.filters.items }} pressedIds={filters} onPressedIdsChange={setFilters} />
      </Stack>
    </Section>
  );
}

export function TagsInputPreview() {
  const [value, setValue] = useState<readonly string[]>(tags.initial);
  const [message, setMessage] = useState<string | null>(null);
  return (
    <Section title={tags.title} description={tags.description}>
      <Stack gap="md">
        <TagsInput
          label={tags.label}
          description={tags.fieldDescription}
          placeholder={tags.placeholder}
          tags={value}
          onTagsChange={(next) => { setValue(next); setMessage(null); }}
          policy={{ maxTags: tags.maxTags }}
          onReject={(result) => setMessage(
            result.reason === "duplicate" ? tags.duplicate(result.value)
              : result.reason === "limit" ? tags.limit
                : null,
          )}
          composeRemoveLabel={tags.removeLabel}
        />
        {/* 문구는 제품이 만든다 — 계약은 거절 사유만 알려 준다. */}
        {message ? <Notice tone="warning" title={message} /> : null}
      </Stack>
    </Section>
  );
}
