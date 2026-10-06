# 일정과 식별 정보 티켓

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [QRCode](../../qr-code.md), `packages/react/src/qr-code.tsx`, `packages/react-native/src/qr-code.tsx`, `showcase/web/src/patterns/stea-expression-previews.tsx`(`EventTicket`), `showcase/native/src/stea-expression-previews.tsx`, `showcase/shared/stea-expressions.ts`(`ticketCopy`), `src/qr-code-recipe.ts`, `src/card.ts`
- 스토리북: `배포/구성/정보 표시/일정과 식별 정보 티켓`

## 언제 쓰나

공연·예약 입장권처럼 일시·장소·좌석 정보와 함께, 현장에서 보여 줄 QR 코드와 사람이 읽을 예매 번호를 한 카드에 담을 때 쓴다.
행동 버튼이 없는 표시용 카드다. 티켓 목록이면 이 카드를 반복하지 말고 [ListRow](../components/list-row.md)로 요약한 뒤 상세에서 이 구성을 연다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `Card` | 제목(공연명)·설명("입장할 때 아래 코드를 보여 주세요") | [Card](../components/card.md) |
| `DescriptionList` | 날짜·시간·장소·좌석 | [DescriptionList](../components/description-list.md) |
| `QRCode` | 예매 번호를 담은 QR. `label`(필수 접근성 이름), `fallback`(필수, QR 바로 아래 항상 그려지는 대체 안내) | [QRCode](../components/qr-code.md) |
| `Text` label muted + `Text` title strong | "예매 번호" 라벨과 번호 | [Text](../components/text.md) |
| `Skeleton`·`Result` | 티켓을 불러오는 중·불러오기 실패(화면 상태) | [Skeleton](../components/skeleton.md), [Result](../components/result.md) |
| `Container` | 바깥 틀의 최대 폭·좌우 여백 | [Container](../components/container.md) |

## 배치

```text
┌ 바깥 틀: 스크롤(Web 문서, Native ScrollView 위아래 spacing.md 16) ┐
│ ← Container gutter 16(폭 600 미만)/20 · 최대 720 →                │
│ ┌ Card ────────────────────────────────────┐  body padding spacing.md 16
│ │ 가을 밤 재즈 공연              (title)   │
│ │ 입장할 때 아래 코드를 보여 주세요 (muted)│
│ │ 날짜   2026년 10월 17일 토요일           │  ← DescriptionList
│ │ 시간   저녁 7시 30분 (입장 7시부터)      │
│ │ 장소   서울 마포구 …                     │
│ │ 좌석   A열 12번                          │
│ │            ↕ spacing.lg 20               │
│ │ ┌──────────┐                             │
│ │ │ ▓▓ QR ▓▓ │  ← size 192(기본)            │
│ │ └──────────┘                             │
│ │ 대체 안내 (fallback, 항상 QR 바로 아래)  │
│ │            ↕ spacing.sm 12               │
│ │ 예매 번호                (label muted)   │
│ │            ↕ spacing.sm 12               │
│ │ JZ-1017-A12-4821         (title strong)  │
│ └──────────────────────────────────────────┘
│ ░ 하단 안전 영역(Native 화면 host 소유) ░                          │
└────────────────────────────────────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web: `Container size="reading"`. Native: `ScrollView` → `Container` | 화면 본문, 카드는 스크롤과 함께 움직인다. 안전 영역은 화면 host(SafeArea·navigation header)가 준다. 입력이 없어 키보드 처리는 없다 | Native `ScrollView` 위아래 `spacing.md` 16, 좌우는 `Container` `gutter`(폭 600 미만 `compact` 16, 이상 `regular` 20). 최대 폭 `layout.readingMaxWidth` 720 |
| 틀 | `Card` | 바깥 틀 안 | body padding `spacing.md` 16(`cardRecipe`) |
| 정보 | `DescriptionList` | Card 머리 아래 | 정보–식별 묶음 `Stack gap="lg"` 20 |
| 식별 묶음 | `QRCode`(+fallback) → 라벨 → 번호 | 정보 아래, 시작 정렬 | 묶음 안 `Stack gap="sm"` 12, QR `size` 기본 192(모듈 수의 정수배로 내림), quiet zone 4모듈. QR–fallback 사이 간격은 컴포넌트가 주지 않는다 |
| 로딩·실패 | `Skeleton`·`Result` | 카드 자리 | Skeleton `block` 기본 높이 `spacing.xxl` 32. Result는 자체 여백(`resultRecipe`) |

- QR은 번호 **위**에 두고, 번호는 QR이 읽히지 않을 때 직원이 입력할 수 있도록 항상 같이 보인다.
- QR 색은 `qrCodeRecipe` 고정값(전경 `#000000`, 배경 `#ffffff`)이다. 다크 테마에서도 흰 바탕으로 그려진다.
- 행동 버튼이 없는 카드다. 실패 화면의 다시 시도 하나만 primary 행동이다.

## 흐름과 상태

1. 사용자가 티켓 화면을 연다. 제품이 티켓을 불러오는 동안 카드 자리에 Skeleton을 둔다.
2. 불러오면 정보·QR·번호를 그린다. 상호작용은 없다.
3. 현장에서 QR을 보여 준다. 스캔이 안 되면 예매 번호를 읽어 준다(Native는 번호를 길게 눌러 선택·복사할 수 있다).
4. 불러오기가 실패하면(네트워크·서버) 카드 대신 `Result status="failure"`와 다시 시도를 둔다. 다시 시도하면 1로 돌아간다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 정보 + QR + 번호 | QR은 `label`("입장 QR 코드, 예매 번호 …")로 읽힌다 |
| 진행 중 | 티켓을 불러오는 중(처음·다시 시도): 카드 자리에 `Skeleton`. 값이 없으면 `QRCode`를 그리지 않는다(빈 `value`는 `TypeError`) | Native Skeleton `accessibilityLabel`(`ticket.loading`) |
| 실패 | 네트워크·서버 실패: `Result status="failure"` + 다시 시도(primary 하나). 다시 시도도 실패하면 같은 Result를 다시 보이고 문구로 실패를 알린다 | Result 제목이 읽힌다. 다시 시도 뒤 포커스는 Result 행동에 둔다 |
| 스캔 실패(현장) | QR 아래 fallback 안내와 예매 번호로 대신한다 | fallback·번호가 텍스트로 읽힌다 |
| 다크 테마 | Card·글자는 테마를 따르고 QR은 흰 바탕 유지 | — |
| 큰 글자 | DescriptionList 값이 줄바꿈되고 번호가 길게 이어짐 | — |

## 코드 골격

```tsx
// Web
import { Card, DescriptionList } from "@hjmds/react/display";
import { Result, Skeleton } from "@hjmds/react/feedback";
import { Container, Stack, Text } from "@hjmds/react/layout";
import { QRCode } from "@hjmds/react/qr-code";

<Container size="reading">
  {ticketState.status === "loading" ? <Skeleton shape="block" height={320} /> :
   ticketState.status === "failed" ? (
    <Result status="failure" title={t("ticket.loadFailed.title")} description={t("ticket.loadFailed.body")}
      actions={[{ label: t("ticket.retry"), onAction: reload }]} />
  ) : (
    <Card title={ticketState.ticket.title} description={t("ticket.showAtEntry")}>
      <Stack gap="lg">
        <DescriptionList aria-label={t("ticket.details")} items={ticketState.ticket.details} />
        <Stack gap="sm">
          {/* QRCode의 svg가 inline이라 fallback을 블록으로 감싸 아래 줄에 둔다. */}
          <QRCode value={ticketState.ticket.booking} label={t("ticket.qrLabel", { booking: ticketState.ticket.booking })}
            fallback={<Stack gap="xs"><Text tone="muted">{t("ticket.qrFallback")}</Text></Stack>} />
          <Text variant="label" tone="muted">{t("ticket.bookingLabel")}</Text>
          <Text variant="title" emphasis="strong">{ticketState.ticket.booking}</Text>
        </Stack>
      </Stack>
    </Card>
  )}
</Container>
```

```tsx
// Native
import { ScrollView, useWindowDimensions } from "react-native";
import { Card, DescriptionList } from "@hjmds/react-native/data-display";
import { Result, Skeleton } from "@hjmds/react-native/feedback";
import { Container, Stack, Text } from "@hjmds/react-native/primitives";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { QRCode } from "@hjmds/react-native/qr-code";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

const { spacing } = useHjmNativeTheme().tokens;
const gutter = resolveWindowClass(useWindowDimensions().width) === "compact" ? "compact" : "regular";

<ScrollView contentContainerStyle={{ paddingVertical: spacing.md }}>
  <Container size="reading" gutter={gutter}>
    {ticketState.status === "loading" ? <Skeleton shape="block" height={320} accessibilityLabel={t("ticket.loading")} /> :
     ticketState.status === "failed" ? (
      <Result status="failure" title={t("ticket.loadFailed.title")} description={t("ticket.loadFailed.body")}
        actions={[{ label: t("ticket.retry"), onAction: reload }]} />
    ) : (
      <Card title={ticketState.ticket.title} description={t("ticket.showAtEntry")}>
        <Stack gap="lg">
          <DescriptionList label={t("ticket.details")} descriptor={{ items: ticketState.ticket.details }} />
          <Stack gap="sm">
            <QRCode value={ticketState.ticket.booking} label={t("ticket.qrLabel", { booking: ticketState.ticket.booking })}
              fallback={<Text tone="muted">{t("ticket.qrFallback")}</Text>} />
            <Text variant="label" tone="muted">{t("ticket.bookingLabel")}</Text>
            <Text selectable variant="title" emphasis="strong">{ticketState.ticket.booking}</Text>
          </Stack>
        </Stack>
      </Card>
    )}
  </Container>
</ScrollView>
```

`ticketState`(`{ status: "loading" } | { status: "failed" } | { status: "ready"; ticket }`)·`reload`와 공연명·일시·장소·좌석·예매 번호는 제품 소유다. Skeleton 높이 320은 예시다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 바깥 틀 | 문서 스크롤 + `Container` | `ScrollView`(위아래 `spacing.md`) + `Container` |
| `DescriptionList` 이름·항목 | `aria-label` + `items` | `label` + `descriptor={{ items }}` |
| fallback 감싸기 | inline svg 옆으로 흐르지 않게 `Stack`으로 감싼다 | `Text` 그대로 |
| 번호 선택 | 브라우저 기본 텍스트 선택 | `Text selectable` |
| QR 배치 prop | 배치 전용 `layoutStyle`만 | 없음(감싸는 레이아웃에서 정한다) |
| QR peer | `qrcode-generator` 2.0.4 | `qrcode-generator` 2.0.4 + `react-native-svg` 15.15.5(dev client 재빌드) |

## 함정

- `QRCode`는 root에서 내보내지 않는다. `/qr-code` subpath로만 import하고 optional peer를 설치한다. Native에서 peer가 없으면 기기 번들에서 실패한다.
- `label`이 비거나 `fallback`이 없거나 `size`가 모듈당 2px(`qrCodeRecipe.minModuleSize`)보다 작으면 `TypeError`다. `value`가 비어도 `TypeError`라 불러오는 중에는 QR을 그리지 않는다.
- `QRCode`에는 `style`·`className`이 없다. 크기는 `size`, 위치는 감싸는 레이아웃에서 정한다. Web만 배치 전용 `layoutStyle`을 받는다(`packages/react/src/qr-code.tsx`).
- 현재 스토리는 기본·다크·큰 글자만 있고 불러오는 중·불러오기 실패 상태가 없다.
