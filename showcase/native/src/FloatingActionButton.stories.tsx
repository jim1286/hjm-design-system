import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { ScrollView, View } from "react-native";
import { FloatingActionButton, useFloatingActionButtonScroll, resolveFloatingActionButtonContentClearance } from "@hjmds/react-native/floating-action-button";
import { TopBar } from "@hjmds/react-native/top-bar";
import { List, ListRow } from "@hjmds/react-native/data-display";
import { Dialog } from "@hjmds/react-native/overlays";
import { TextArea } from "@hjmds/react-native/inputs";
import { Text } from "@hjmds/react-native/primitives";
import { nativeRendererStoryGroups } from "./story-registry";

export function FloatingNotesPreview() {
  const scroll = useRef<ScrollView>(null);
  const { layoutMode, onScroll } = useFloatingActionButtonScroll();
  const [clearance, setClearance] = useState(resolveFloatingActionButtonContentClearance(0));
  const [notes, setNotes] = useState(Array.from({ length: 18 }, (_, index) => `기억하고 싶은 순간 ${index + 1}`));
  const [open, setOpen] = useState(false); const [draft, setDraft] = useState("");
  function save() { if (!draft.trim()) return; setNotes((items) => [draft.trim(), ...items]); setOpen(false); setDraft(""); scroll.current?.scrollTo({ y: 0, animated: false }); }
  return <View style={{ flex: 1, position: "relative" }}>
    {/* Frame-paced events let the direction hook accumulate small gestures instead of missing reversals between sparse events. */}
    <ScrollView ref={scroll} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: clearance }}>
      <TopBar title="나의 기록" />
      <List label="최근 기록">{notes.map((note, index) => <ListRow key={`${index}-${note}`} title={note} description="작은 순간도 모아두면 오래 남아요." />)}</List>
    </ScrollView>
    <FloatingActionButton descriptor={{ label: "새 기록", icon: { name: "add" }, layoutMode }} renderIcon={() => <Text tone="inverse">＋</Text>}
      onContentClearanceChange={setClearance} onPress={() => setOpen(true)} />
    <Dialog title="어떤 순간을 남길까요?" open={open} onOpenChange={setOpen} closeLabel="닫기"
      primaryAction={{ label: "기록 추가", onPress: save, disabled: !draft.trim() }}>
      <TextArea label="나의 기록" value={draft} onValueChange={setDraft} />
    </Dialog>
  </View>;
}

const meta = { title: "Patterns/Floating action button", component: FloatingNotesPreview } satisfies Meta<typeof FloatingNotesPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Notes: Story = { parameters: { hjm: { componentIds: nativeRendererStoryGroups.floatingActionButton } } };
