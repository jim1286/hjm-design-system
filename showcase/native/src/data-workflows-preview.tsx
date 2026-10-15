import { Button } from "@hjmds/react-native/actions";
import { useState } from "react";
import { ImportFieldMapping, ConversionFunnel, CohortRetentionTable, CorrelationMatrix, TargetSummary, HistogramExplorer } from "@hjmds/react-native/data-workflows";
import type { ImportMapping } from "@hjmds/design-contracts/data-workflows";
import { Stack, Text } from "@hjmds/react-native/primitives";

export function ImportMappingPreview() {
  const [mapping, setMapping] = useState<ImportMapping>({ name: "title", email: null }), [result, setResult] = useState("");
  return <Stack gap="md"><ImportFieldMapping label="CSV 열 연결" sources={[{ id: "name", label: "원본 이름" }, { id: "email", label: "원본 이메일" }]} targets={[{ id: "title", label: "이름", required: true }, { id: "contact", label: "연락처" }]}
    mapping={mapping} onMappingChange={setMapping} onImport={async snapshot => setResult(`연결 확정: ${Object.values(snapshot).filter(Boolean).length}열`)} importLabel="연결 확정" skipLabel="건너뛰기" dismissLabel="닫기" errorLabel="연결하지 못했어요" validationLabel={state => state.duplicateTargets.length ? "하나의 대상에 여러 열을 연결할 수 없어요" : "필수 열을 연결하세요"}
    previewRows={[{ id: "1", values: { name: "서연", email: "seoyeon@example.com" } }]} /><Text>{result}</Text></Stack>;
}
export function FunnelPreview() { return <ConversionFunnel label="기록 작성 흐름" stages={[{ id: "open", label: "열기", count: 240 }, { id: "write", label: "작성", count: 120, reason: "수집된 사용자 응답: 작성 시간 부족" }, { id: "save", label: "저장", count: 96 }]}
  formatCount={String} missingLabel="관측 없음" detailLabel={stage => `${stage.label} ${stage.count}명 · 전체 대비 ${stage.conversion === null ? "미정" : `${Math.round(stage.conversion * 100)}%`}${stage.reason ? ` · ${stage.reason}` : ""}`} />; }
export function CohortPreview() { return <CohortRetentionTable label="주별 잔존율" cohortColumnLabel="가입 주" periods={["0주", "1주", "2주", "3주"]}
  cohorts={[{ id: "1", label: "9월 1주", size: 100, retained: [100, 70, 45, 30] }, { id: "2", label: "9월 2주", size: 80, retained: [80, 40, 0] }, { id: "3", label: "9월 3주", size: 50, retained: [50, 35] }]}
  formatRate={rate => `${Math.round(rate * 100)}%`} missingLabel="미관측" />; }
export function CorrelationPreview() { return <CorrelationMatrix label="사용 지표 상관" variableColumnLabel="변수" data={{ variables: [{ id: "visits", label: "방문" }, { id: "writes", label: "작성" }, { id: "gap", label: "방문 간격" }], values: [[1, .8, -.6], [.8, 1, -.4], [-.6, -.4, 1]] }} formatValue={value => value.toFixed(2)} missingLabel="미관측" />; }
export function TargetPreview() { const [target, setTarget] = useState(20); return <Stack gap="lg"><TargetSummary label="이번 달 기록" actual={24} target={target} formatActual={value => `${value}개`}
  summaryLabel={summary => summary.ratio === null ? "목표 미설정" : `목표 ${summary.target}개 · ${Math.round(summary.ratio * 100)}% 달성`} /><Button tone="secondary" onPress={() => setTarget(target ? 0 : 20)}>목표 설정 전환</Button></Stack>; }
const samples = [1, 2, 2, 3, 3, 3, 4, 5, 7, 9, null];
export function HistogramPreview() { const [count, setCount] = useState(4); return <HistogramExplorer label="작성 소요 시간" samples={samples} domain={[0, 10]} binCount={count} binCounts={[2, 4, 8]} onBinCountChange={setCount}
  binLabel={bin => `${bin.lower.toFixed(1)}–${bin.upper.toFixed(1)}`} binCountLabel={value => `${value}구간`} formatCount={String} missingLabel="미관측"
  summaryLabel={h => `${h.observed}개 관측 · ${h.missing}개 미관측 · 범위 밖 ${h.underflow + h.overflow}개`} />; }
