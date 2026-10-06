import { useState } from "react";
import { Agreement } from "@hjmds/react/agreement";
import { AuthProviderButton } from "@hjmds/react/provider-button";
import { AuthScreenLayout } from "@hjmds/react/auth-screen";
import { Top } from "@hjmds/react/top";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Notice } from "@hjmds/react/feedback";
import { Stack } from "@hjmds/react/layout";

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
      <Top
        descriptor={{
          eyebrow: "2026년 9월",
          title: size === "large" ? "화면의 첫 제목입니다" : "시트 안의 첫 제목입니다",
          description: "TopBar와 달리 본문이라 스크롤과 함께 올라가고, 큰 글자에서도 잘리지 않아요.",
          size,
        }}
        trailing={<Button tone="ghost" onClick={() => setSize(size === "large" ? "medium" : "large")}>크기 바꾸기</Button>}
      />
      <p>본문이 여기서 이어집니다.</p>
    </Stack>
  );
}

/*
  로고는 제품 자산이라 예제에서도 슬롯으로 넘긴다 — 여기서는 글자 한 자로 대신한다.
  실제 제품은 각 제공자가 배포하는 마크를 넣는다.
*/
const providers = [
  { id: "google", label: "Google", mark: "G" },
  { id: "kakao", label: "카카오", mark: "K" },
  { id: "naver", label: "네이버", mark: "N" },
  { id: "apple", label: "Apple", mark: "" },
] as const;

export function AuthProviderButtonPreview() {
  return <AuthScreenLayoutPreview />;
}

export function AuthScreenLayoutPreview({ loading = false }: { loading?: boolean } = {}) {
  const [busy, setBusy] = useState(false);
  return <AuthScreenLayout mainCard
    {...(busy || loading ? { pendingLabel: "로그인 중" } : {})}
    hero={<Top descriptor={{ title: "어떤 계정으로 시작할까요", description: "쓰던 계정으로 바로 시작할 수 있어요.", size: "medium" }} />}
    main={
      <Stack gap="sm">
        {providers.map((provider) => (
          <AuthProviderButton
            key={provider.id}
            descriptor={{ provider: provider.id, label: provider.label }}
            logo={<span aria-hidden="true">{provider.mark}</span>}
            // This is a demo completion delay; products clear pending on real success, cancellation or failure.
            onClick={() => { setBusy(true); window.setTimeout(() => setBusy(false), 1200); }}
          />
        ))}
      </Stack>}
    footer={<span>개인정보 처리방침 · 이용약관</span>} />;
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
