import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { RefreshCw } from "lucide-react-native";
import { useState } from "react";
import { CommentThreadScreen, type CommentThreadItem } from "@hjmds/react-native/screen-flows";
import { Button, IconButton } from "@hjmds/react-native/actions";
import { Notice } from "@hjmds/react-native/feedback";
import { Text } from "@hjmds/react-native/primitives";

/** A local failed full load leaves the preview readable; no server or account mutation is involved. */
export function CommentRepliesPreview() {
  const { colors } = useHjmNativeTheme();
  const [status, setStatus] = useState<'failed' | 'ready' | 'complete'>('failed');
  const [expanded, setExpanded] = useState(true);
  const item = (id: string, parentId: string | null, body: string): CommentThreadItem => ({
    id, parentId, author: parentId ? '민수' : '서연', body: <Text>{body}</Text>, timeLabel: '조금 전',
    likeCountLabel: '', likeIcon: null, likeLabel: '좋아요', likeAction: null, canReply: false,
  });
  const root: CommentThreadItem = { ...item('root', null, '댓글과 답글은 같은 공통 구조를 사용해요.'), repliesCount: 3,
    repliesNotice: status === 'failed' ? <Notice tone="danger" title="답글을 불러오지 못했어요"
      action={<IconButton label="다시 시도" tone="secondary" onPress={() => setStatus('ready')}><RefreshCw size={20} color={colors.text} accessible={false} /></IconButton>} /> : undefined,
    repliesFooter: status === 'ready' ? <Button tone="link" onPress={() => setStatus('complete')}>답글 더 불러오기</Button> : undefined,
  };
  return <CommentThreadScreen title="답글 실패와 복구" threadHeader={<Text>오류가 나도 받은 미리보기는 유지해요. 접기와 다시 시도를 눌러 보세요.</Text>}
    items={[root, item('preview', 'root', '먼저 받은 미리보기'), ...(status === 'complete' ? [item('reply2', 'root', '복구한 두 번째 답글'), item('reply3', 'root', '마지막 답글')] : [])]}
    expandedIds={expanded ? ['root'] : []} onExpandedChange={() => setExpanded(value => !value)} onLike={() => {}} onReply={() => {}}
    replyLabel="답글 달기" moreRepliesLabel={count=>`답글 ${count}개 더 보기`} repliesLabel={(count, open) => open ? '답글 접기' : `답글 ${count}개 보기`} />;
}
