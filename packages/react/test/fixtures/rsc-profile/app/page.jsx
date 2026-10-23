import { HjmProvider } from '@hjmds/react/provider';
import { Surface, Text } from '@hjmds/react/layout';
import { CompositionLayout } from '@hjmds/react/screens';
import { Card } from '@hjmds/react/display';
import { Heading } from '@hjmds/react/heading';
import { Link } from '@hjmds/react/actions';
import { defineHjmDesignProfile } from '@hjmds/design-contracts/design-profile';

// The server owns profile data and article children; only the renderer entries cross the client boundary.
// screens/display/heading/actions are the entries Diairy re-exported from its own "use client" file until
// every context-reading module declared the directive (2026-10-23).
const profile = defineHjmDesignProfile({
  extends: 'paper',
  id: 'rsc-owned',
  tokens: { radius: { md: 29 } },
  compositions: { collection: 'rows' },
});

export default function Page() {
  return (
    <HjmProvider theme="light" designProfile={profile}>
      <Surface as="article" radius="md" padding="md">
        <h1>Server-owned guide</h1>
        <Text>Product-owned paper profile</Text>
        <input aria-label="Draft" defaultValue="server draft" />
        <CompositionLayout title="Server composition">
          <Card>
            <Heading level="level3" semanticLevel={2}>Server heading</Heading>
            <Link href="#guide">Guide link</Link>
          </Card>
        </CompositionLayout>
      </Surface>
    </HjmProvider>
  );
}
