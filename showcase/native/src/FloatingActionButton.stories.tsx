import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { ScrollView, View } from "react-native";
import { FloatingActionButton, useFloatingActionButtonScroll, resolveFloatingActionButtonContentClearance } from "@hjmds/react-native/floating-action-button";
import { ScreenLayout } from "@hjmds/react-native/screens";
import { List, ListRow } from "@hjmds/react-native/data-display";
import { Dialog } from "@hjmds/react-native/overlays";
import { TextArea } from "@hjmds/react-native/inputs";
import { Container } from "@hjmds/react-native/primitives";
import { semanticGlyph } from "./semantic-glyphs";
import { componentIds } from "@hjmds/design-contracts";

// Not exported: CSF registers every named export as a story, which showed an unnamed menu entry (2026-10-06).
function FloatingNotesPreview() {
  // A controlled dialog needs its opening host to restore accessibility focus after dismissal.
  const composerTrigger = useRef<View>(null);
  const scroll = useRef<ScrollView>(null);
  const { layoutMode, onScroll } = useFloatingActionButtonScroll();
  const [clearance, setClearance] = useState(resolveFloatingActionButtonContentClearance(0));
  const [notes, setNotes] = useState(Array.from({ length: 18 }, (_, index) => `기억하고 싶은 순간 ${index + 1}`));
  const [open, setOpen] = useState(false); const [draft, setDraft] = useState("");
  // A second queued press can arrive before the closing render commits.
  const savedInSession = useRef(false);
  function start() { savedInSession.current = false; setOpen(true); }
  function save() { if (savedInSession.current || !draft.trim()) return; savedInSession.current = true; setNotes((items) => [draft.trim(), ...items]); setOpen(false); setDraft(""); scroll.current?.scrollTo({ y: 0, animated: false }); }
  return <View style={{ flex: 1, position: "relative" }}>
    {/* Frame-paced events let the direction hook accumulate small gestures instead of missing reversals between sparse events. */}
    <ScreenLayout title="나의 기록" contentInset="none" scrollRef={scroll} scrollProps={{ onScroll, scrollEventThrottle: 16 }}>
      {/* The reading Container owns the side gutter, so the shell adds no second body inset. */}
      <Container size="reading" layoutStyle={{ marginBottom: clearance }}><List label="최근 기록">{notes.map((note, index) => <ListRow key={`${index}-${note}`} title={note} description="작은 순간도 모아두면 오래 남아요." />)}</List></Container>
    </ScreenLayout>
    <FloatingActionButton ref={composerTrigger} descriptor={{ label: "새 기록", icon: { name: "add" }, layoutMode }} renderIcon={({ name, size, color }) => semanticGlyph({ name, size, color, strokeWidth: 2 })}
      onContentClearanceChange={setClearance} onPress={start} />
    <Dialog title="어떤 순간을 남길까요?" open={open} onOpenChange={setOpen} closeLabel="닫기" returnFocusRef={composerTrigger}
      primaryAction={{ label: "기록 추가", onPress: save, disabled: !draft.trim() }}>
      <TextArea label="나의 기록" value={draft} onValueChange={setDraft} />
    </Dialog>
  </View>;
}

const meta = { title: "배포/구성/입력과 작성/빠른 메모 작성", component: FloatingNotesPreview } satisfies Meta<typeof FloatingNotesPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본", parameters: { hjm: { componentIds: [componentIds.FloatingActionButton] } } };
export const Dark: Story = { ...Default, name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { ...Default, name: "큰 글자", globals: { textScale: "2" } };
