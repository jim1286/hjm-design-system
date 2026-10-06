import { useId, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, UIManager, View } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ProgressiveBlur, type ProgressiveBlurHostLayer } from '@hjmds/react-native/progressive-blur';
import type { ScrollMetrics } from '@hjmds/design-contracts/scroll-progress';
import { useHjmNativeTheme } from '@hjmds/react-native/provider';
import { Button } from '@hjmds/react-native/actions';
import { Stack, Text, Surface } from '@hjmds/react-native/primitives';
import { TextField } from '@hjmds/react-native/inputs';

// Both optional view hosts must exist in the installed binary. Importing first
// would crash old development clients, and a tint fallback is not real blur.
const available = Boolean(requireOptionalNativeModule('ExpoBlur') && UIManager.getViewManagerConfig('RNCMaskedView'));
const blur = available ? require('expo-blur') as typeof import('expo-blur') : null;
const Mask = available ? (require('@react-native-masked-view/masked-view') as typeof import('@react-native-masked-view/masked-view')).default : null;

function Layer({ layer, target }: { layer: ProgressiveBlurHostLayer; target: React.RefObject<View | null> }) {
  const { environment } = useHjmNativeTheme();
  const id = useId().replace(/:/g, '');
  if (!blur || !Mask) return null;
  const reverse = layer.side === 'top' || layer.side === 'left';
  const horizontal = layer.side === 'left' || layer.side === 'right';
  // The mask's white is alpha geometry, not a product surface color. Native
  // intensity is host-relative and must not be advertised as CSS pixel parity.
  // An explicit HJM theme may differ from the OS; default tint washed out dark previews.
  return <Mask style={StyleSheet.absoluteFill} maskElement={<Svg width="100%" height="100%">
    <Defs><LinearGradient id={id} x1={horizontal && reverse ? '100%' : '0%'} x2={horizontal && !reverse ? '100%' : '0%'} y1={!horizontal && reverse ? '100%' : '0%'} y2={!horizontal && !reverse ? '100%' : '0%'}>
      <Stop offset={layer.start} stopColor="white" stopOpacity={0}/><Stop offset={layer.end} stopColor="white" stopOpacity={1}/>
    </LinearGradient></Defs><Rect width="100%" height="100%" fill={`url(#${id})`}/>
  </Svg>}><blur.BlurView style={StyleSheet.absoluteFill} intensity={layer.strength * 100} tint={environment.theme} blurTarget={target} blurMethod="dimezisBlurView"/></Mask>;
}

export function ProgressiveBlurPreview() {
  const [metrics, setMetrics] = useState<ScrollMetrics>({ offset: 0, contentSize: 0, viewportSize: 0 });
  const [focused, setFocused] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [count, setCount] = useState(12);
  const [saved, setSaved] = useState('');
  const target = useRef<View>(null);
  const Target = blur?.BlurTargetView ?? View;
  return <Stack gap="lg">
    <Text>목록 끝에서는 효과가 사라져 마지막 항목까지 읽을 수 있어요. 메모에 입력하는 동안에도 가리지 않아요.</Text>
    <Button tone="ghost" selected={enabled} onPress={() => setEnabled(v => !v)}>{enabled ? '효과 끄기' : '효과 켜기'}</Button>
    <Button tone="secondary" onPress={() => setCount(v => v === 12 ? 1 : 12)}>{count === 12 ? '항목 하나만 보기' : '목록 늘리기'}</Button>
    {!available ? <Text>이 개발 앱에는 블러 또는 마스크 모듈이 없습니다. 목록은 효과 없이 사용할 수 있어요.</Text> : null}
    {Platform.OS === 'android' && Number(Platform.Version) < 31 ? <Text>Android 12 이전 블러 비용은 별도 검증이 필요합니다.</Text> : null}
    <View style={{ position: 'relative', overflow: 'hidden' }}>
      <Target ref={target}>
        <ScrollView accessibilityLabel="기록 목록" style={{ height: 320 }} keyboardShouldPersistTaps="handled"
          onLayout={e => setMetrics(v => ({ ...v, viewportSize: e.nativeEvent.layout.height }))}
          onContentSizeChange={(_width, height) => setMetrics(v => ({ ...v, contentSize: height }))}
          onScroll={e => { const offset = e.nativeEvent.contentOffset.y; setMetrics(v => ({ ...v, offset })); }} scrollEventThrottle={16}>
          <Stack gap="md">{Array.from({ length: count }, (_, index) => <Surface key={index} padding="md" bordered><Stack gap="sm">
            <Text>{`기록 ${index + 1}`}</Text><TextField label={`메모 ${index + 1}`} defaultValue="읽거나 작성 중인 내용" onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}/>
            <Button onPress={() => setSaved(`기록 ${index + 1} 선택됨`)}>선택 {index + 1}</Button>
          </Stack></Surface>)}</Stack>
        </ScrollView>
      </Target>
      {enabled && available ? <>{(['top', 'bottom'] as const).map(edge => <ProgressiveBlur key={edge} descriptor={{ edge, extent: 64, strength: 0.5, content: { kind: 'scroll', metrics, focused } }} renderLayer={layer => <Layer layer={layer} target={target}/>} />)}</> : null}
    </View>
    <Text accessibilityLiveRegion="polite">{saved || '선택한 기록이 없어요.'}</Text>
  </Stack>;
}
