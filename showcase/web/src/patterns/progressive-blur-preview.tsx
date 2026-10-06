import { useState } from 'react';
import { ProgressiveBlur } from '@hjmds/react/progressive-blur';
import { useScrollMetrics } from '@hjmds/react/scroll-progress';
import { Button } from '@hjmds/react/actions';
import { Stack, Text, Surface } from '@hjmds/react/layout';
import { TextField } from '@hjmds/react/forms';

export function ProgressiveBlurPreview() {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const metrics = useScrollMetrics(host);
  const [focused, setFocused] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [count, setCount] = useState(12);
  const [saved, setSaved] = useState('');
  return <Stack gap="lg">
    <Text>목록 끝에서는 효과가 사라져 마지막 항목까지 읽을 수 있어요. 목록을 키보드로 조작하는 동안에도 가리지 않아요.</Text>
    <Button tone="ghost" selected={enabled} onClick={() => setEnabled(v => !v)}>{enabled ? '효과 끄기' : '효과 켜기'}</Button>
    <Button tone="secondary" onClick={() => setCount(v => v === 12 ? 1 : 12)}>{count === 12 ? '항목 하나만 보기' : '목록 늘리기'}</Button>
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div ref={setHost} role="region" aria-label="기록 목록" tabIndex={0} style={{ height: 320, overflow: 'auto' }}
        onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
        <Stack gap="md">{Array.from({ length: count }, (_, index) => <Surface key={index} padding="md" bordered>
          <Stack gap="sm"><Text>{`기록 ${index + 1}`}</Text><TextField label={`메모 ${index + 1}`} defaultValue="읽거나 작성 중인 내용"/>
          <Button onClick={() => setSaved(`기록 ${index + 1} 선택됨`)}>선택 {index + 1}</Button></Stack>
        </Surface>)}</Stack>
      </div>
      {enabled ? <>{(['top', 'bottom'] as const).map(edge => <ProgressiveBlur key={edge} descriptor={{ edge, extent: 64, strength: 0.5, content: { kind: 'scroll', metrics, focused } }} />)}</> : null}
    </div>
    <Text role="status">{saved || '선택한 기록이 없어요.'}</Text>
  </Stack>;
}
