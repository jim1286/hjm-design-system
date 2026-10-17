import { useState } from "react";
import { Agreement } from "@hjmds/react/agreement";
import { AuthProviderButton } from "@hjmds/react/provider-button";
import { AuthScreenFooter, AuthScreenHero, AuthScreenLayout } from "@hjmds/react/auth-screen";
import { Top } from "@hjmds/react/top";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Notice } from "@hjmds/react/feedback";
import { Stack, Text } from "@hjmds/react/layout";
import { SegmentedControl } from "@hjmds/react/selection";
import { PreviewTools } from "./preview-tools";
import { agreementExample as agreement, authExample as auth, authPreviewDelayMs, topExample as topCopy } from "../../../shared/component-examples";

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
  const labelOf = (id: string) => agreement.items.find((item) => item.id === id)?.label ?? id;
  return (
    <Stack gap="md">
      <Top descriptor={agreement.top} />
      <TextField label={agreement.emailLabel} value={email} onChange={(event) => setEmail(event.target.value)} />
      <Agreement
        descriptor={{ accessibilityLabel: agreement.accessibilityLabel, allLabel: agreement.allLabel, items: agreement.items }}
        checkedIds={checked}
        onCheckedIdsChange={setChecked}
        onStateChange={(state) => { setSatisfied(state.satisfied); setMissing(state.missingRequiredIds); }}
        requiredLabel={agreement.requiredLabel}
        optionalLabel={agreement.optionalLabel}
      />
      {/* 문장은 제품이 만든다 — 계약은 어떤 항목이 남았는지만 알려준다. */}
      {missing.length ? <p role="status">{agreement.missing(missing.map(labelOf))}</p> : null}
      <Button disabled={!satisfied || email.trim().length === 0} onClick={() => setJoined(true)}>
        {agreement.submit}
      </Button>
      {joined ? <Notice tone="success" title={agreement.joined.title} description={agreement.joined.description} /> : null}
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
    hero={<AuthScreenHero title={auth.hero.title} description={auth.hero.description} />}
    main={<ProviderButtons busyId={null} onPress={start} />}
    footer={<AuthScreenFooter links={auth.policyLinks.map(label => ({ label, href: "https://policies.jmstudioapps.com/", target: "_blank", accessibilityHint: "새 탭에서 열려요" }))} />} />;
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
