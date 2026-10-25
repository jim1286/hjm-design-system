import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectSource, readContracts, reviewFreshness } from './audit-consumer-ui.mjs';
const imports = `import {Stack as S} from '@hjmds/react/layout'; import {Button as B} from '@hjmds/react/actions';`;
const scan = code => inspectSource(imports + code).findings.filter(f => f.rule === 'action-group-gap');
test('reads spacing from authored contracts', () => {
  const c = readContracts();
  assert.equal(c.actionGroupRecipe.stackedGap, c.spacing.xs);
  assert.equal(c.stackRecipe.defaults.gap, 'md');
});
test('catches original FaDetail fragment/conditional leak and accepts isolated action group', () => {
  assert.equal(scan(`<S gap="lg">{contract && <><div>body</div><B>A</B></>}{!hide && <B>B</B>}</S>`).filter(f=>f.rule==='action-group-gap').length, 1);
  assert.equal(scan(`<S gap="lg"><div>body</div><S gap="xs">{contract && <B>A</B>}{!hide && <B>B</B>}</S></S>`).length, 0);
});
test('does not merge mutually exclusive branches or separate body blocks', () => {
  assert.equal(scan(`<S gap="lg">{ok ? <B>A</B> : <B>B</B>}</S>`).length, 0);
  assert.equal(scan(`<S gap="lg"><B>A</B><div>body</div><B>B</B></S>`).length, 0);
});
test('default gap is checked; dynamic overrides require review', () => {
  assert.equal(scan(`<S><B>A</B><B>B</B></S>`)[0].level,'violation');
  assert.equal(scan(`<S gap={dynamic}><B>A</B><B>B</B></S>`)[0].level,'review');
  assert.equal(scan(`<S gap="xs" {...props}><B>A</B><B>B</B></S>`)[0].level,'review');
});
test('namespace imports work, unrelated components are not treated as HJM', () => {
  assert.equal(inspectSource(`import * as L from '@hjmds/react/layout'; import * as A from '@hjmds/react/actions'; <L.Stack gap="lg"><A.Button>A</A.Button><A.Button>B</A.Button></L.Stack>`).findings.find(f=>f.rule==='action-group-gap')?.rule,'action-group-gap');
  assert.equal(inspectSource(`import {Stack,Button} from 'another-library'; <Stack><Button/><Button/></Stack>`).findings.length,0);
});
test('lists, gutters, scrolling, navigation and states remain review candidates', () => {
  const code=`import {ScreenLayout} from '@hjmds/react-native/screens'; import {Container} from '@hjmds/react-native/layout'; import {List,Card} from '@hjmds/react-native/display'; import {ScrollView,Pressable,ActivityIndicator} from 'react-native'; <ScreenLayout><Container><Card><List/></Card></Container><ScrollView/><Pressable accessibilityRole="tab"/><ActivityIndicator/></ScreenLayout>`;
  const findings=inspectSource(code).findings;
  for(const rule of ['list-wrapper','screen-gutter','scroll-owner','navigation-owner','state-owner']) assert.ok(findings.some(f=>f.rule===rule && f.level==='review'),rule);
});
test('many optional branches retain adjacency without exponential enumeration', () => {
  const findings=scan(`<S>${Array.from({length:80},(_,i)=>`{v${i} && <B/>}`).join('')}</S>`);
  assert.ok(findings.some(f=>f.rule==='action-group-gap'));
  assert.ok(!findings.some(f=>f.rule==='unresolved-branches'));
});
test('mapped notification rows are inspected even with a block callback', () => {
  const code=`import {Stack} from '@hjmds/react/layout'; import {NotificationRow} from '@hjmds/react/display'; <Stack gap="sm">{rows.map(row => {const label=row.label;return <NotificationRow preview={label}/>;})}</Stack>`;
  assert.ok(inspectSource(code).findings.some(f=>f.rule==='row-rhythm'));
});
test('edge-to-edge screens can intentionally supply their own Container gutter', () => {
  assert.equal(inspectSource(`import {ScreenLayout} from '@hjmds/react/screens'; import {Container} from '@hjmds/react/layout'; <ScreenLayout contentInset="none"><Container/></ScreenLayout>`).findings.length,0);
});
test('resolved local button adapters are reviewed rather than claimed as proven geometry', () => {
  const findings=inspectSource(`import {Stack} from '@hjmds/react/layout';import {AppButton} from './button';<Stack gap="lg"><AppButton/><AppButton/></Stack>`,readContracts(),'input.tsx',new Map([['./button#AppButton','Button']])).findings;
  assert.equal(findings[0].level,'review');
});

test('standalone action links share button spacing, editorial inline links do not', () => {
  const source=`import {Stack} from '@hjmds/react/layout';import {Button,Link} from '@hjmds/react/actions';`;
  assert.ok(inspectSource(source+`<Stack axis="inline" gap="md"><Button/><Link variant="standalone"/></Stack>`).findings.some(f=>f.rule==='action-group-gap'));
  assert.equal(inspectSource(source+`<Stack gap="md"><Button/><Link/></Stack>`).findings.length,0);
});

test('native header safety requires a proven top owner, not merely a bottom inset', () => {
  const imports = `import {ScreenHost as Host} from '@hjmds/react-native/screens';import {FollowListScreen as People} from '@hjmds/react-native/follow-list';`;
  const findings = code => inspectSource(imports + code).findings.filter(f => f.rule.startsWith('safe-area-top'));
  assert.equal(findings(`<People safeAreaBottom={insets.bottom}/>`)[0].rule, 'safe-area-top-owner');
  assert.equal(findings(`<Host><People/></Host>`).length, 0);
  assert.equal(findings(`import {SafeAreaView as Safe} from 'react-native-safe-area-context';<Safe edges={['top']}><People/></Safe>`).length, 0);
  assert.equal(findings(`import {SafeAreaView as Safe} from 'react-native-safe-area-context';<Safe><Host><People/></Host></Safe>`)[0].rule, 'safe-area-top-duplicate');
  assert.equal(findings(`<Host edges={['left','right']}><People/></Host>`)[0].level, 'review');
  assert.equal(findings(`<Host edges={edges}><People/></Host>`)[0].level, 'review');
  assert.equal(findings(`<Host {...props}><People/></Host>`)[0].level, 'review');
  assert.equal(findings(`<Host><Host><People/></Host></Host>`)[0].rule, 'safe-area-top-duplicate');
  assert.equal(findings(`<Host><Host edges={['left','right']}><People/></Host></Host>`).length, 0);
  assert.equal(inspectSource(`import {ScreenLayout} from '@hjmds/react/screens';<ScreenLayout/>`).findings.length, 0);
});

test('action semantics and header tools are independent from ordinary 8pt action gaps', () => {
  const source=`import {Stack} from '@hjmds/react/layout'; import {Button,IconButton} from '@hjmds/react/actions'; import {ScreenLayout} from '@hjmds/react/screens';`;
  const rules=code=>inspectSource(source+code).findings.map(f=>f.rule);
  assert.ok(rules(`<Stack gap="xs"><Button/><Button/></Stack>`).includes('competing-primary-actions'));
  assert.ok(!rules(`<Stack gap="xs"><Button/><Button tone="secondary"/></Stack>`).includes('competing-primary-actions'));
  assert.ok(rules(`<Button selected={selected}/>`).includes('selection-control'));
  assert.ok(rules(`<ScreenLayout actions={<Button>Save</Button>}/>`).includes('header-text-action'));
  assert.ok(rules(`<ScreenLayout actions={<Stack gap="xs"><IconButton size="large"/><IconButton/></Stack>}/>`).includes('header-tool-gap'));
  assert.ok(rules(`<ScreenLayout actions={<IconButton size="large"/>}/>`).includes('header-tool-size'));
  assert.ok(!rules(`<ScreenLayout actions={<Stack gap="xxs"><IconButton size="small" hitSlop={0}/><IconButton size="small" hitSlop={0}/></Stack>}/>`).includes('header-tool-gap'));
  assert.ok(rules(`<Stack gap="xs"><Button size="small"/><Button size="large" tone="secondary"/></Stack>`).includes('action-size-mismatch'));
});

test('focus inspection includes raw inputs and imperative focus, not explicit false', () => {
  assert.ok(inspectSource(`<input autoFocus/>`).findings.some(f=>f.rule==='input-focus-owner'));
  assert.ok(!inspectSource(`<input autoFocus={false}/>`).findings.some(f=>f.rule==='input-focus-owner'));
  assert.ok(inspectSource(`useEffect(()=>{field.current.focus();},[]);`).findings.some(f=>f.rule==='imperative-focus'));
});

test('review freshness tracks owner dependencies, deleted files and absent evidence without suppressing findings', async () => {
  const {mkdtempSync,writeFileSync,mkdirSync,rmSync}=await import('node:fs');
  const {tmpdir}=await import('node:os'); const {join}=await import('node:path'); const {createHash}=await import('node:crypto');
  const root=mkdtempSync(join(tmpdir(),'hjm-review-'));
  try {
    mkdirSync(join(root,'apps/example'),{recursive:true});writeFileSync(join(root,'apps/example/screen.tsx'),'screen');writeFileSync(join(root,'owner.tsx'),'owner');
    const hash=s=>createHash('sha256').update(s).digest('hex');
    const item={app:'example',file:'screen.tsx',reviewedSha256:hash('screen'),evidence:[{file:'owner.tsx',sha256:hash('owner')}]};
    const report={headerSafetyAudit:{items:[item]}};
    assert.equal(reviewFreshness(report,root)[0].status,'source-unchanged');
    writeFileSync(join(root,'owner.tsx'),'changed');assert.equal(reviewFreshness(report,root)[0].status,'stale');
    rmSync(join(root,'owner.tsx'));assert.equal(reviewFreshness(report,root)[0].status,'stale');
    delete item.evidence;assert.equal(reviewFreshness(report,root)[0].status,'dependencies-unrecorded');
  } finally {rmSync(root,{recursive:true,force:true});}
});

test('barrel exports and React forwardRef preserve control identity for consumer review', async () => {
  const {mkdtempSync,writeFileSync,rmSync}=await import('node:fs');
  const {tmpdir}=await import('node:os'); const {join}=await import('node:path');
  const {wrapperResolver}=await import('./audit-consumer-ui.mjs');
  const root=mkdtempSync(join(tmpdir(),'hjm-adapter-'));
  try {
    writeFileSync(join(root,'button.tsx'),`import {forwardRef} from 'react'; import {Button as B,IconButton as I} from '@hjmds/react/actions'; export const AppButton=forwardRef(function AppButton(p,r){return <B {...p} ref={r}/>}); export function AppIcon(p){return <I {...p}/>}`);
    writeFileSync(join(root,'index.ts'),`export {AppButton,AppIcon} from './button';`);
    const source=`import {AppButton,AppIcon} from './index';import {ScreenLayout} from '@hjmds/react/screens';<ScreenLayout actions={<AppIcon size="large"/>}><AppButton selected={value}/></ScreenLayout>`;
    const wrappers=wrapperResolver(root)(source,join(root,'screen.tsx'));
    assert.equal(wrappers.get('./index#AppButton'),'Button');
    assert.equal(wrappers.get('./index#AppIcon'),'IconButton');
    const rules=inspectSource(source,readContracts(),'screen.tsx',wrappers).findings.map(f=>f.rule);
    assert.ok(rules.includes('selection-control'));assert.ok(rules.includes('header-tool-size'));
  } finally {rmSync(root,{recursive:true,force:true});}
});
