import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { resolveTreeCheckedStates, toggleTreeCheckedSelection } from "@hjmds/design-contracts/components/tree-select";
import { Tree } from "@hjmds/react/tree";
import { Popover } from "@hjmds/react/popover";
import { Button } from "@hjmds/react/actions";
import { List, ListRow } from "@hjmds/react/display";
import { Notice } from "@hjmds/react/feedback";
import { Stack, Section } from "@hjmds/react/layout";

const folders = [
  {
    id: "2026", label: "2026년", textValue: "2026년",
    children: [
      { id: "september", label: "9월", textValue: "9월", children: [
        { id: "walk", label: "느리게 걸었던 오후", textValue: "느리게 걸었던 오후" },
        { id: "meal", label: "함께 먹은 저녁", textValue: "함께 먹은 저녁" },
      ] },
      { id: "october", label: "10월", textValue: "10월", children: [
        { id: "view", label: "창밖으로 본 풍경", textValue: "창밖으로 본 풍경" },
      ] },
    ],
  },
  { id: "archive", label: "보관함", textValue: "보관함", children: [
    { id: "old", label: "지난 기록", textValue: "지난 기록", disabled: true },
  ] },
];

const announce = ({ depth, position, siblingCount, label, hasChildren, expanded }: {
  depth: number; position: number; siblingCount: number; label: string; hasChildren: boolean; expanded: boolean;
}) => `${depth}단계 ${siblingCount}개 중 ${position}번째, ${label}${hasChildren ? (expanded ? ", 펼쳐짐" : ", 접힘") : ""}`;

export function TreePreview() {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set(["2026"]));
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <Section title="폴더로 찾아보기" description="연도와 달을 펼쳐 기록을 골라보세요.">
      <Stack gap="md">
        <Tree
          label="기록 폴더"
          nodes={folders}
          expandedKeys={expanded}
          onExpandedKeysChange={setExpanded}
          selection={{ mode: "single", selectedKey: selected, onSelectionChange: setSelected }}
          composeAccessibleName={announce}
        />
        <p role="status">{selected ? `${selected} 선택됨` : "아직 고르지 않았어요"}</p>
      </Stack>
    </Section>
  );
}

/*
  TreeSelect는 새 primitive가 아니다 — docs/tree-select.md의 판정대로 Select의 표면
  (트리거 + 팝업 + 확정된 값)과 Tree의 collection, 그리고 tri-state 판정 모듈을 조합한다.
  이 화면이 그 조합의 작동 예제다.
*/
export function TreeSelectPreview() {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  const [applied, setApplied] = useState<ReadonlySet<string>>(new Set());
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set(["2026", "september"]));
  const states = resolveTreeCheckedStates(folders, checked);
  const appliedLabels = [...applied];
  return (
    <Section title="폴더를 골라 모아보기" description="여러 폴더를 한 번에 선택할 수 있어요.">
      <Stack gap="md">
        <Popover
          open={open}
          onOpenChange={(next) => { if (next) setChecked(applied); setOpen(next); }}
          title="폴더 고르기"
          closeLabel="닫기"
          trigger={<Button tone="secondary">{applied.size ? `${applied.size}개 폴더 선택됨` : "폴더 고르기"}</Button>}
        >
          {({ close }) => (
            <Stack gap="sm">
              <Tree
                label="폴더 선택"
                nodes={folders}
                expandedKeys={expanded}
                onExpandedKeysChange={setExpanded}
                checkedStates={states}
                onCheckedToggle={(id) => setChecked(toggleTreeCheckedSelection(folders, checked, id))}
                composeAccessibleName={announce}
              />
              <Button onClick={() => { setApplied(checked); close(); }}>이대로 보기</Button>
            </Stack>
          )}
        </Popover>
        {appliedLabels.length ? (
          <List label="고른 폴더">
            {appliedLabels.map((id) => <ListRow key={id} title={id} />)}
          </List>
        ) : <Notice title="아직 고른 폴더가 없어요" description="폴더를 고르면 여기에 모아서 보여드려요." />}
      </Stack>
    </Section>
  );
}


/*
  Cascader는 catalog가 TreeSelect의 prerequisite로 묶어 둔 항목이다. Tree renderer가
  들어오면서 경로(부모 사슬)는 resolve 결과에서 그대로 파생되고 중간 단계 확정은 노드를
  그대로 고르면 되므로, 새 컴포넌트 대신 이 조합 예제로 제공한다. 열(column) 방식의 antd
  화면을 베끼지 않고 HJM의 계층 탐색 어휘를 그대로 쓴다.
*/
const pathOf = (id: string): readonly string[] => {
  const walk = (nodes: typeof folders, trail: readonly string[]): readonly string[] | null => {
    for (const node of nodes) {
      const next = [...trail, node.label];
      if (node.id === id) return next;
      const found = node.children ? walk(node.children as typeof folders, next) : null;
      if (found) return found;
    }
    return null;
  };
  return walk(folders, []) ?? [];
};

export function CascaderPreview() {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set(["2026"]));
  const [draft, setDraft] = useState<string | null>(null);
  const [committed, setCommitted] = useState<readonly string[]>([]);
  const [open, setOpen] = useState(false);
  return (
    <Section title="어디에 넣을까요" description="중간 단계에서 멈춰도 괜찮아요.">
      <Stack gap="md">
        <Popover
          open={open}
          onOpenChange={(next) => { if (next) setDraft(null); setOpen(next); }}
          title="옮길 위치 고르기"
          closeLabel="닫기"
          trigger={<Button tone="secondary">{committed.length ? committed.join(" › ") : "위치 고르기"}</Button>}
        >
          {({ close }) => (
            <Stack gap="sm">
              <Tree
                label="옮길 위치"
                nodes={folders}
                expandedKeys={expanded}
                onExpandedKeysChange={setExpanded}
                selection={{ mode: "single", selectedKey: draft, onSelectionChange: setDraft }}
                composeAccessibleName={announce}
              />
              <p role="status">{draft ? pathOf(draft).join(" › ") : "아직 고르지 않았어요"}</p>
              <Button onClick={() => { if (draft) setCommitted(pathOf(draft)); close(); }}>여기로 옮기기</Button>
            </Stack>
          )}
        </Popover>
        {committed.length ? <Notice tone="success" title="옮길 위치를 정했어요" description={committed.join(" › ")} /> : null}
      </Stack>
    </Section>
  );
}

const meta = { title: "Patterns/Tree", component: TreePreview } satisfies Meta<typeof TreePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Folders: Story = {};
export const TreeSelectComposition: Story = { render: () => <TreeSelectPreview /> };
export const CascaderComposition: Story = { render: () => <CascaderPreview /> };
export const LargeText: Story = { globals: { textScale: "2" } };
