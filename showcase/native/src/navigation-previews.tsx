import { Heading } from "@hjmds/react-native/heading";
import { PatternStatus } from "./pattern-status";
import { useState } from "react";
import { NavigationBar } from "@hjmds/react-native/navigation-bar";
import { Button } from "@hjmds/react-native/actions";
import { Icon, Stack, Text } from "@hjmds/react-native/primitives";
import { semanticGlyph } from "./semantic-glyphs";
import { SearchField } from "@hjmds/react-native/inputs";
import { Menu } from "@hjmds/react-native/navigation";
export function GlassPreview() {
 const [destination, setDestination] = useState("홈"); const [query, setQuery] = useState(""); const [signedIn, setSignedIn] = useState(false);
 return <Stack gap="xl"><Heading level="level3">나만의 작업 공간</Heading><NavigationBar label="사이트 탐색" brand={<Text variant="label">HJM</Text>} actions={<><SearchField accessibilityLabel="검색" clearLabel="검색 지우기" busyLabel="검색 중" value={query} onValueChange={setQuery} layoutStyle={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}/><Button tone="secondary" onPress={() => setSignedIn(!signedIn)}>{signedIn ? "내 계정" : "로그인"}</Button></>}><Button tone="ghost" onPress={() => setDestination("홈")}>홈</Button><Menu triggerLabel="서비스" dismissLabel="닫기" renderTrigger={props => <Button tone="ghost" trailing={<Icon descriptor={{ name: "chevronDown" }} renderGlyph={semanticGlyph} />} {...props}>서비스</Button>} items={[{ id: "프로젝트", label: "프로젝트" }, { id: "문서", label: "문서" }]} onAction={setDestination}/><Button tone="ghost" onPress={() => setDestination("소개")}>소개</Button></NavigationBar><PatternStatus>{query ? `검색 결과: ${["프로젝트", "문서", "소개"].filter(item => item.includes(query)).join(", ") || "없음"}` : `${destination} 화면`}</PatternStatus><Text>로그인은 화면 상태를 보여주는 예제입니다.</Text></Stack>;
}
