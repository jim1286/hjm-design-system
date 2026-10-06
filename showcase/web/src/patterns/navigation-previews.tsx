import { Heading } from "@hjmds/react/heading";
import { useState } from "react";
import { NavigationBar } from "@hjmds/react/navigation-bar";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import { SearchField } from "@hjmds/react/forms";
import { Menu } from "@hjmds/react/overlays";
export function GlassPreview() {
 const [destination, setDestination] = useState("홈"); const [query, setQuery] = useState(""); const [signedIn, setSignedIn] = useState(false);
 return <Stack gap="xl"><Heading level="level3">나만의 작업 공간</Heading><NavigationBar label="사이트 탐색" brand={<Text variant="label">HJM</Text>} actions={<><SearchField label="검색" clearLabel="검색 지우기" value={query} onValueChange={setQuery}/><Button tone="secondary" onClick={() => setSignedIn(!signedIn)}>{signedIn ? "내 계정" : "로그인"}</Button></>}><Button tone="ghost" onClick={() => setDestination("홈")}>홈</Button><Menu label="서비스" trigger={<Button tone="ghost">서비스 ▾</Button>} items={[{ id: "프로젝트", label: "프로젝트" }, { id: "문서", label: "문서" }]} onAction={setDestination}/><Button tone="ghost" onClick={() => setDestination("소개")}>소개</Button></NavigationBar><Text role="status">{query ? `검색 결과: ${["프로젝트", "문서", "소개"].filter(item => item.includes(query)).join(", ") || "없음"}` : `${destination} 화면`}</Text><Text>로그인은 화면 상태를 보여주는 예제입니다.</Text></Stack>;
}
