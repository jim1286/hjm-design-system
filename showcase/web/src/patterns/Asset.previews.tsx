import { Asset, AssetGroup } from "@hjmds/react/asset";
import { Icon } from "@hjmds/react/display";
import { Section, Stack, Text } from "@hjmds/react/layout";
import { assetExample as copy } from "../../../shared/component-examples.js";

/*
  한 줄에 아이콘·이미지·Lottie·비디오가 섞여 나오는 상황이 이 컴포넌트가 생긴 이유다.
  액자만 공통이고 안에 무엇을 넣을지는 제품이 정한다 — 여기서는 글자로 대신한다.
  묶음 이름은 접근성 이름일 뿐이라 화면에도 보이도록 따로 적는다(2026-10-17 review E22).
*/
export function AssetPreview() {
  return (
    <Section title={copy.title} description={copy.description}>
      <Stack gap="lg">
        <Stack gap="xs">
          <Text variant="label" tone="muted">{copy.groupLabel}</Text>
          <AssetGroup label={copy.groupLabel} size="large">
            {copy.group.map((item) => (
              <Asset key={item.id} descriptor={"label" in item ? { kind: item.kind, size: "large", accessibilityLabel: item.label } : { kind: item.kind, size: "large", decorative: true }}
                {...("playable" in item ? { accessory: <Icon name="play" /> } : {})}>
                {/* 재생 여부는 계약이 이미 판정해서 넘겨준다. */}
                <Text>{item.glyph}</Text>
              </Asset>
            ))}
          </AssetGroup>
        </Stack>
        <Stack axis="inline" gap="sm" align="end">
          {copy.sizes.map((item) => (
            <Asset key={item.id} descriptor={{ kind: item.kind, size: item.size, ...("shape" in item ? { shape: item.shape } : {}), accessibilityLabel: item.label }}
              {...("playable" in item ? { accessory: <Icon name="play" /> } : {})}>
              <Text>{item.glyph}</Text>
            </Asset>
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}
