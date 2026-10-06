import { useRef, useState } from 'react';
import { Text as NativeText, View, type TextLayoutEvent } from 'react-native';
import { Button } from '@hjmds/react-native/actions';
import { Stack, Text } from '@hjmds/react-native/primitives';

/** Diagnostic fixture, not a public experiment. Temporarily render from an
 * existing story to compare paragraph and nested-fragment host measurements.
 * Keep the fixture because character-count estimates cannot prove glyph geometry.
 */
export function TextAnnotationMeasurementProbe() {
  const fragment = useRef<NativeText>(null);
  const [narrow, setNarrow] = useState(false);
  const [parent, setParent] = useState('대기');
  const [nested, setNested] = useState('대기');
  const [layout, setLayout] = useState('대기');
  const [measure, setMeasure] = useState('대기');
  const summarize = (event: TextLayoutEvent) => event.nativeEvent.lines.map(line => ({ text: line.text, x: line.x, y: line.y, width: line.width, height: line.height }));
  return <Stack gap="md">
    <Text>문장 조각 측정 진단</Text>
    <View style={{ width: narrow ? 184 : 280 }}>
      <Text onTextLayout={event => { const data = summarize(event); setParent(String(data.length)); console.log('HJM_ANNOTATION_PARAGRAPH', JSON.stringify(data)); }}>
        {'앞 문장 '}
        <NativeText ref={fragment}
          onTextLayout={event => { const data = summarize(event); setNested(String(data.length)); console.log('HJM_ANNOTATION_FRAGMENT', JSON.stringify(data)); }}
          onLayout={event => { setLayout(JSON.stringify(event.nativeEvent.layout)); console.log('HJM_ANNOTATION_LAYOUT', JSON.stringify(event.nativeEvent.layout)); }}>
          {'강조할 긴 문장이 다음 줄로 이어져도 각 줄의 위치를 알아야 합니다'}
        </NativeText>
        {' 뒤 문장'}
      </Text>
    </View>
    <Button onPress={() => setNarrow(value => !value)}>폭 변경</Button>
    <Button onPress={() => fragment.current?.measure((x, y, width, height) => { const value = JSON.stringify({ x, y, width, height }); setMeasure(value); console.log('HJM_ANNOTATION_MEASURE', value); })}>조각 측정</Button>
    <Text>{`부모 줄 ${parent} / 조각 줄 ${nested}`}</Text>
    <Text>{`조각 layout ${layout}`}</Text>
    <Text>{`조각 measure ${measure}`}</Text>
  </Stack>;
}
