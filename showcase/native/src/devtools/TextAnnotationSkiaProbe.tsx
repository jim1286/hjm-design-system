import { useMemo, useState } from 'react';
import { Text as NativeText, View } from 'react-native';
import { Canvas, Paragraph, Path, Skia, TextAlign, TextDirection } from '@shopify/react-native-skia';
import { mergeTextAnnotationFragments, resolveTextAnnotationGeometry } from '@hjmds/design-contracts/text-annotation';
import { Button } from '@hjmds/react-native/actions';
import { Stack, Text } from '@hjmds/react-native/primitives';
import { useHjmNativeTheme } from '@hjmds/react-native/provider';

const samples = [
  { prefix: '앞 문장 ', fragment: '강조할 긴 문장이 다음 줄로 이어져도 각 줄의 위치를 알아야 합니다', suffix: ' 뒤 문장', rtl: false },
  { prefix: '앞 🙂 ', fragment: '👩🏽‍💻 한글과 emoji 뒤의 강조 범위', suffix: ' 마지막', rtl: false },
  { prefix: 'قبل ', fragment: 'نص عربي مع English 123 ثم نص عربي طويل لاختبار التفاف السطور', suffix: ' بعد', rtl: true },
] as const;

/** Exact-range experiment only. Skia measures the same paragraph it paints;
 * the native Text underneath is a comparison, never the target of these rects.
 * Canvas does not acquire native text selection merely by receiving an AX label.
 */
export function TextAnnotationSkiaProbe() {
  const theme = useHjmNativeTheme();
  const [sampleIndex, setSampleIndex] = useState(0), [narrow, setNarrow] = useState(false);
  const sample = samples[sampleIndex]!, width = narrow ? 184 : 280;
  const full = sample.prefix + sample.fragment + sample.suffix;
  const start = sample.prefix.length, end = start + sample.fragment.length;
  const measured = useMemo(() => {
    const builder = Skia.ParagraphBuilder.Make({
      textDirection: sample.rtl ? TextDirection.RTL : TextDirection.LTR,
      textAlign: sample.rtl ? TextAlign.Right : TextAlign.Left,
      textStyle: { fontSize: 24, heightMultiplier: 1.6, color: Skia.Color(theme.colors.text) },
    });
    builder.addText(full);
    const paragraph = builder.build(); paragraph.layout(width);
    const rects = paragraph.getRectsForRange(start, end).map(rect => ({ x: rect.x, y: rect.y, width: rect.width, height: rect.height }));
    const metrics = paragraph.getLineMetrics();
    const merged = mergeTextAnnotationFragments(rects.map(rect => {
      // Choose the measured line with greatest vertical intersection. Font
      // fallback runs can have different tight tops/heights on the same line.
      const line = metrics.reduce((best, candidate) => {
        const overlap = (value: typeof candidate) => Math.max(0, Math.min(rect.y + rect.height, value.baseline + value.descent) - Math.max(rect.y, value.baseline - value.ascent));
        return overlap(candidate) > overlap(best) ? candidate : best;
      });
      return { ...rect, lineIndex: line.lineNumber };
    }));
    const indices = rects.map(rect => paragraph.getGlyphPositionAtCoordinate(rect.x + rect.width / 2, rect.y + rect.height / 2));
    console.log('HJM_ANNOTATION_SKIA', JSON.stringify({ sampleIndex, width, start, end, rects, merged, indices, height: paragraph.getHeight(), lineCount: metrics.length }));
    return { paragraph, rects, merged, indices };
  }, [sampleIndex, sample.rtl, width, full, start, end, theme.colors.text]);
  const geometry = resolveTextAnnotationGeometry(measured.merged, 'highlight');
  return <Stack gap="md">
    <Text>Skia 문장 범위 진단</Text>
    <Stack axis="inline" wrap>
      <Button onPress={() => setSampleIndex(value => (value + 1) % samples.length)}>다음 문장</Button>
      <Button onPress={() => setNarrow(value => !value)}>폭 변경</Button>
    </Stack>
    <Text>{`범위 ${start}–${end}, 조각 ${measured.rects.length}→${measured.merged.length}, 폭 ${width}`}</Text>
    <View accessible accessibilityRole="text" accessibilityLabel={full} style={{ width }}>
      <Canvas accessible={false} importantForAccessibility="no-hide-descendants" style={{ width, height: measured.paragraph.getHeight() }}>
        {geometry.paths.map((path, index) => <Path key={index} path={path.d} color={theme.colors.primary} opacity={0.2} />)}
        <Paragraph paragraph={measured.paragraph} x={0} y={0} width={width} />
      </Canvas>
    </View>
    <Text>Native Text 비교 · 위 강조 좌표를 적용하지 않음</Text>
    <NativeText selectable style={{ width, fontSize:24, lineHeight:38.4, color:theme.colors.text, writingDirection:sample.rtl?'rtl':'ltr' }}>{full}</NativeText>
  </Stack>;
}
