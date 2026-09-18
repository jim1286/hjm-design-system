import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { ScrollView } from "react-native";
import { TopBar } from "@hjmds/react-native/top-bar";
import { BottomCTA } from "@hjmds/react-native/bottom-cta";
import { Container, Stack, Section } from "@hjmds/react-native/primitives";
import { List, ListRow } from "@hjmds/react-native/data-display";
import { Switch } from "@hjmds/react-native/inputs";
import { Notice } from "@hjmds/react-native/feedback";

function NotificationSettings() {
  const [activity, setActivity] = useState(true);
  const [digest, setDigest] = useState(false);
  const [saved, setSaved] = useState(false);
  return <ScrollView><Stack gap="lg">
    <TopBar title="알림 설정" />
    <Container size="reading">
      <Section title="필요한 소식만 받아요" description="원하는 알림을 골라주세요. 언제든 바꿀 수 있어요.">
        <List label="받을 알림" appearance="plain">
          <ListRow title="내 활동" description="댓글과 답글이 도착하면 알려드려요."
            trailing={<Switch labelVisibility="hidden" label="내 활동 알림" checked={activity} onCheckedChange={(value) => { setActivity(value); setSaved(false); }} />} />
          <ListRow title="주간 모아보기" description="일주일의 소식을 한 번에 받아요."
            trailing={<Switch labelVisibility="hidden" label="주간 모아보기 알림" checked={digest} onCheckedChange={(value) => { setDigest(value); setSaved(false); }} />} />
        </List>
        {saved ? <Notice tone="success" title="알림 설정을 저장했어요" description={`내 활동 ${activity ? "켜짐" : "꺼짐"} · 주간 모아보기 ${digest ? "켜짐" : "꺼짐"}`} /> : null}
      </Section>
    </Container>
    <BottomCTA description="선택한 알림만 보내드릴게요."
      primaryAction={{ label: saved ? "저장했어요" : "이 설정으로 저장하기", onPress: () => setSaved(true), disabled: saved }} />
  </Stack></ScrollView>;
}

const meta = { title: "Patterns/Notification settings", component: NotificationSettings } satisfies Meta<typeof NotificationSettings>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
