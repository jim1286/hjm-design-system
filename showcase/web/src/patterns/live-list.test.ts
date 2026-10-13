import { expect, it } from 'vitest';
import { initialLiveList, updateLiveList } from '../../../shared/live-list';

it('preserves stable ids and drafts across ordered local actions without recycling deleted ids', () => {
  const edited = updateLiveList(initialLiveList, { type: 'edit', id: 'item-1', note: 'draft' });
  const added = updateLiveList(updateLiveList(edited, { type: 'add', count: 1 }), { type: 'add', count: 3 });
  expect(added.items.map(item => item.id)).toEqual(['item-3', 'item-4', 'item-5', 'item-2', 'item-1']);
  expect(added.items.at(-1)?.note).toBe('draft');
  let state = updateLiveList(added, { type: 'reverse' });
  expect(state.items[0]?.note).toBe('draft');
  while (state.items.length) state = updateLiveList(state, { type: 'remove' });
  expect(updateLiveList(state, { type: 'remove' })).toBe(state);
  expect(updateLiveList(state, { type: 'reverse' })).toBe(state);
  state = updateLiveList(state, { type: 'add', count: 1 });
  expect(state.items[0]).toMatchObject({ id: 'item-6', note: '' });
  expect(updateLiveList(state, { type: 'edit', id: 'item-1', note: 'stale' }).items).toEqual(state.items);
});

it('describes successive real additions, removals and reversals distinctly without announcing no-ops', () => {
  const first = updateLiveList(initialLiveList, { type: 'add', count: 1 });
  const second = updateLiveList(first, { type: 'add', count: 1 });
  expect(first.message).toBe('1개 추가됨 · 총 2개'); expect(second.message).toBe('1개 추가됨 · 총 3개');
  const reversed = updateLiveList(second, { type: 'reverse' });
  expect(reversed.message).toContain('기록 1부터');
  expect(updateLiveList(reversed, { type: 'reverse' }).message).toContain('기록 3부터');
  const removed = updateLiveList(second, { type: 'remove' });
  expect(removed.message).toBe('기록 3 삭제됨 · 총 2개');
  expect(updateLiveList(removed, { type: 'remove' }).message).toBe('기록 2 삭제됨 · 총 1개');
  expect(updateLiveList(initialLiveList, { type: 'reverse' })).toBe(initialLiveList);
});
