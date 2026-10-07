import { HjmProvider } from '@hjmds/react/provider';
import { Surface, Text } from '@hjmds/react/layout';
import { defineHjmDesignProfile } from '@hjmds/design-contracts/design-profile';

// The server owns profile data and article children; only the renderer entries cross the client boundary.
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
      </Surface>
    </HjmProvider>
  );
}
