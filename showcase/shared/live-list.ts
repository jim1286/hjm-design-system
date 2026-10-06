export type LiveListItem = { id: string; title: string; note: string; arrived: boolean };
export type LiveListState = { items: LiveListItem[]; nextId: number; message: string };
export type LiveListAction = { type: 'add'; count: number } | { type: 'remove' | 'reverse' } | { type: 'edit'; id: string; note: string };
export const initialLiveList: LiveListState = { items: [{ id: 'item-1', title: '기록 1', note: '작성 중인 메모', arrived: false }], nextId: 2, message: '기록 1개' };
// Explicit local actions model real data updates; no timer fabricates notifications
// or withholds already available rows behind a presentation queue.
export function updateLiveList(state: LiveListState, action: LiveListAction): LiveListState {
 if (action.type === 'add') {
  const added = Array.from({ length: action.count }, (_, i) => { const n = state.nextId + i; return { id: `item-${n}`, title: `기록 ${n}`, note: '', arrived: true }; });
  return { items: [...added, ...state.items], nextId: state.nextId + action.count, message: `${action.count}개 추가됨` };
 }
 if (action.type === 'remove') return { ...state, items: state.items.slice(1), message: '첫 기록 삭제됨' };
 if (action.type === 'reverse') return { ...state, items: [...state.items].reverse(), message: '순서 바뀜' };
 if (action.type === 'edit') return { ...state, items: state.items.map(item => item.id === action.id ? { ...item, note: action.note } : item) };
 return state;
}
