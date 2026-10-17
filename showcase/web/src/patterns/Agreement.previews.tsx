import { useState } from "react";
import { Agreement } from "@hjmds/react/agreement";
import { AuthProviderButton } from "@hjmds/react/provider-button";
import { AuthScreenLayout } from "@hjmds/react/auth-screen";
import { Top } from "@hjmds/react/top";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Notice } from "@hjmds/react/feedback";
import { Stack, Text } from "@hjmds/react/layout";
import { SegmentedControl } from "@hjmds/react/selection";
import { PreviewTools } from "./preview-tools";
import { authExample as auth, authPreviewDelayMs, topExample as topCopy } from "../../../shared/component-examples";

const items = [
  { id: "terms", label: "서비스 이용약관", required: true, detail: { label: "전문 보기", href: "#terms" } },
  { id: "privacy", label: "개인정보 처리방침", required: true, detail: { label: "전문 보기", href: "#privacy" } },
  { id: "age", label: "만 14세 이상입니다", required: true },
  { id: "marketing", label: "마케팅 정보 수신", description: "새 소식과 이벤트를 알려드려요. 언제든 끌 수 있어요.", detail: { label: "전문 보기" } },
];

/*
  가입 화면 한 장이 이 세 조각으로 끝난다: Top(무엇을 묻는 화면인지), 본문, Agreement.
  지금까지 제품이 각자 조립하던 조합을 그대로 보여 준다.
*/
export function AgreementPreview() {
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  const [satisfied, setSatisfied] = useState(false);
  const [missing, setMissing] = useState<readonly string[]>([]);
  const [joined, setJoined] = useState(false);
  const [email, setEmail] = useState("");
  const labelOf = (id: string) => items.find((item) => item.id === id)?.label ?? id;
  return (
    <Stack gap="md">
      <Top descriptor={{ eyebrow: "가입", title: "기록을 시작할까요", description: "이메일과 약관 동의만 있으면 돼요." }} />
      <TextField label="이메일" value={email} onChange={(event) => setEmail(event.target.value)} />
      <Agreement
        descriptor={{ accessibilityLabel: "가입 약관 동의", allLabel: "전체 동의하기", items }}
        checkedIds={checked}
        onCheckedIdsChange={setChecked}
        onStateChange={(state) => { setSatisfied(state.satisfied); setMissing(state.missingRequiredIds); }}
        requiredLabel="(필수)"
        optionalLabel="(선택)"
      />
      {/* 문장은 제품이 만든다 — 계약은 어떤 항목이 남았는지만 알려준다. */}
      {missing.length ? <p role="status">{missing.map(labelOf).join(", ")}에 동의해 주세요</p> : null}
      <Button disabled={!satisfied || email.trim().length === 0} onClick={() => setJoined(true)}>
        가입하고 시작하기
      </Button>
      {joined ? <Notice tone="success" title="가입했어요" description="이제 첫 기록을 남겨보세요." /> : null}
    </Stack>
  );
}

export function TopPreview() {
  const [size, setSize] = useState<"medium" | "large">("large");
  return (
    <Stack gap="md">
      <Top descriptor={{ eyebrow: topCopy.eyebrow, title: topCopy.titles[size], description: topCopy.description, size }} />
      <Text as="p">{topCopy.body}</Text>
      {/* The size switch is a preview control, not a product action, so it stays out of Top's trailing slot. */}
      <PreviewTools>
        <SegmentedControl label={topCopy.sizeLabel} items={topCopy.sizes.map(item => ({ value: item.value, label: item.label }))} value={size}
          onValueChange={value => { if (value === "large" || value === "medium") setSize(value); }} />
      </PreviewTools>
    </Stack>
  );
}

function ProviderButtons({ busyId, onPress }: { busyId: string | null; onPress(id: string): void }) {
  return <Stack gap="xs">
    {auth.providers.map((provider) => (
      <AuthProviderButton key={provider.id} descriptor={{ provider: provider.id, label: provider.label, busy: busyId === provider.id }}
        logo={<span aria-hidden="true">{provider.mark}</span>} onClick={() => onPress(provider.id)} />
    ))}
  </Stack>;
}

function useAuthPending() {
  const [busyId, setBusyId] = useState<string | null>(null);
  return { busyId, start: (id: string) => { setBusyId(id); window.setTimeout(() => setBusyId(null), authPreviewDelayMs); } };
}

/* The button story shows the buttons alone (pressing one shows its pending state); the full screen is AuthScreenLayout's story. */
export function AuthProviderButtonPreview() {
  const { busyId, start } = useAuthPending();
  return <ProviderButtons busyId={busyId} onPress={start} />;
}

export function AuthScreenLayoutPreview({ loading = false }: { loading?: boolean } = {}) {
  const { busyId, start } = useAuthPending();
  return <AuthScreenLayout mainCard
    {...(busyId !== null || loading ? { pendingLabel: auth.pendingLabel } : {})}
    hero={<Top descriptor={{ title: auth.hero.title, description: auth.hero.description, size: "medium" }} />}
    main={<ProviderButtons busyId={null} onPress={start} />}
    footer={<Text as="span">{auth.footer}</Text>} />;
}


export function AgreementLockedPreview() {
  const [disabled, setDisabled] = useState(true);
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set(['terms']));
  const [detail, setDetail] = useState('');
  return <Stack gap="md">
    <p>제출 중 동의 변경만 잠급니다. 전문은 계속 읽을 수 있습니다.</p>
    <Agreement descriptor={{ accessibilityLabel: '가입 약관', allLabel: '전체 동의', disabled, items: [
      {id:'terms',label:'서비스 이용약관',required:true,detail:{label:'이용약관 읽기'}},
      {id:'privacy',label:'개인정보 처리방침',required:true,detail:{label:'개인정보 처리방침 읽기'}},
    ] }} checkedIds={checked} onCheckedIdsChange={setChecked} onDetail={setDetail} requiredLabel="(필수)" optionalLabel="(선택)" />
    {detail ? <p>{detail === 'terms' ? '이용약관 예시 본문' : '개인정보 처리방침 예시 본문'} — 실제 가입이나 동의 저장은 하지 않습니다.</p> : null}
    <Button tone="secondary" onClick={() => setDisabled(!disabled)}>{disabled ? '동의 잠금 해제' : '동의 변경 잠그기'}</Button>
  </Stack>;
}
