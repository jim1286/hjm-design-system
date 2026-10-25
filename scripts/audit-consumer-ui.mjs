import { createRequire } from 'node:module';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, '../packages/react/package.json'));
const ts = require('typescript');
const parse = (text, file = 'input.tsx') => ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, /\.[cm]?ts$/.test(file) ? ts.ScriptKind.TS : ts.ScriptKind.TSX);
const unwrap = n => {
  while (n && (ts.isAsExpression(n) || ts.isSatisfiesExpression(n) || ts.isParenthesizedExpression(n))) n = n.expression;
  return n;
};
// Read only literal contract declarations. Never execute arbitrary consumer source or maintain a second spacing table.
function literal(n, env) {
  n = unwrap(n);
  if (!n) return undefined;
  if (ts.isStringLiteral(n) || ts.isNumericLiteral(n)) return ts.isNumericLiteral(n) ? Number(n.text) : n.text;
  if (n.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (n.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isIdentifier(n)) return env[n.text];
  if (ts.isArrayLiteralExpression(n)) return n.elements.map(e => literal(e, env));
  if (ts.isPropertyAccessExpression(n)) return literal(n.expression, env)?.[n.name.text];
  if (ts.isObjectLiteralExpression(n)) return Object.fromEntries(n.properties.filter(ts.isPropertyAssignment).map(p => [p.name.getText().replaceAll('"', ''), literal(p.initializer, env)]));
}
export function readContracts() {
  const env = {};
  for (const name of ['foundations.ts', 'component-recipes.ts']) {
    const source = parse(readFileSync(join(here, '../packages/design-contracts/src', name), 'utf8'));
    for (const s of source.statements) if (ts.isVariableStatement(s)) for (const d of s.declarationList.declarations) {
      if (['spacing', 'stackRecipe', 'actionGroupRecipe', 'topBarRecipe'].includes(d.name.getText())) env[d.name.getText()] = literal(d.initializer, env);
    }
  }
  if (!Number.isFinite(env.actionGroupRecipe?.stackedGap) || !env.stackRecipe?.defaults?.gap) throw new Error('Cannot read current HJM spacing contracts');
  return env;
}
export function inspectSource(text, contracts = readContracts(), file = 'input.tsx', wrappers = new Map()) {
  const source = parse(text, file), imports = new Map(), constants = {}, findings = [], inventory = { screens: [], providers: [], localComponents: [], rawControls: [] };
  for (const s of source.statements) {
    if (ts.isImportDeclaration(s) && ts.isStringLiteral(s.moduleSpecifier) && !s.importClause?.isTypeOnly) {
      const from = s.moduleSpecifier.text, b = s.importClause?.namedBindings;
      if (b && ts.isNamedImports(b)) for (const p of b.elements) if (!p.isTypeOnly) imports.set(p.name.text, { from, name: p.propertyName?.text ?? p.name.text });
      if (b && ts.isNamespaceImport(b)) imports.set(b.name.text, { from, name: '*' });
    }
    if (ts.isVariableStatement(s)) for (const d of s.declarationList.declarations) constants[d.name.getText()] = literal(d.initializer, { ...contracts, ...constants });
  }
  function ref(n) {
    const name = n.tagName.getText(source), parts = name.split('.'), binding = imports.get(parts[0]);
    return { name: binding?.name === '*' ? parts[1] : binding?.name ?? name, from: binding?.from ?? 'local', jsx: name };
  }
  const hjm = r => /^@hjmds\/react(?:-native)?(?:\/|$)/.test(r.from);
  const attr = (n, key) => n.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.getText() === key);
  const value = (n, key) => {
    const a = attr(n, key)?.initializer;
    return a && literal(ts.isJsxExpression(a) ? a.expression : a, { ...contracts, ...constants });
  };
  const open = n => !n ? null : ts.isJsxElement(n) ? n.openingElement : ts.isJsxSelfClosingElement(n) ? n : null;
  const line = n => source.getLineAndCharacterOfPosition(n.getStart(source)).line + 1;
  const add = (n, rule, level, message) => findings.push({ line: line(n), rule, level, message });
  // Track possible boundaries/adjacent pairs, not the exponential Cartesian product of branches.
  // This retains the property we inspect (neighbourhood) even in screens with many optional blocks.
  const empty = () => ({first:new Set(), last:new Set(), items:new Set(), pairs:[], empty:true});
  const union = (a,b) => ({first:new Set([...a.first,...b.first]),last:new Set([...a.last,...b.last]),items:new Set([...a.items,...b.items]),pairs:[...a.pairs,...b.pairs],empty:a.empty || b.empty});
  function summary(n) {
    n = unwrap(n);
    if (!n) return empty();
    if (ts.isJsxExpression(n)) return summary(n.expression);
    if (ts.isJsxFragment(n)) return compose(n.children);
    if (ts.isConditionalExpression(n)) return union(summary(n.whenTrue),summary(n.whenFalse));
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return union(empty(),summary(n.right));
    if (ts.isJsxText(n) && !n.text.trim() || n.kind === ts.SyntaxKind.NullKeyword || n.kind === ts.SyntaxKind.FalseKeyword) return empty();
    return {first:new Set([n]),last:new Set([n]),items:new Set([n]),pairs:[],empty:false};
  }
  function compose(children) {
    let a=empty();
    for(const child of children) {
      const b=summary(child);
      a={first:new Set([...a.first,...(a.empty?b.first:[])]),last:new Set([...b.last,...(b.empty?a.last:[])]),items:new Set([...a.items,...b.items]),pairs:[...a.pairs,...b.pairs,...[...a.last].flatMap(l=>[...b.first].map(r=>[l,r]))],empty:a.empty && b.empty};
    }
    return a;
  }
  function combine(children) { const s=compose(children); return [...[...s.items].map(n=>[n]),...s.pairs]; }
  const action = n => { const o = open(n); if (!o) return false; const r = ref(o); return (hjm(r) && (r.name === 'Button' || r.name === 'Link' && value(o, 'variant') === 'standalone')) || wrappers.get(r.from + '#' + r.name) === 'Button'; };
  const wrappedAction = n => { const o = open(n); return o && action(n) && !hjm(ref(o)); };
  const kind = n => { const r=ref(n); return hjm(r) ? r.name : wrappers.get(r.from+'#'+r.name); };
  function inHeader(n) {
    for(let a=n.parent;a;a=a.parent) {
      const o=open(a);
      if(o && hjm(ref(o)) && ref(o).name==='TopBar') return true;
      if(ts.isJsxAttribute(a) && ['header','actions'].includes(a.name.getText())) {
        const owner=a.parent?.parent;
        if(owner && (ts.isJsxOpeningElement(owner)||ts.isJsxSelfClosingElement(owner)) && hjm(ref(owner)) && /Screen$|ScreenLayout$|TopBar$/.test(ref(owner).name)) return true;
      }
    }
    return false;
  }
  function visit(n) {
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      const r = ref(n), direct = hjm(r), parent = ts.isJsxElement(n.parent) ? n.parent : null;
      const rows = parent ? combine(parent.children) : [[]];
      if (direct && /Screen$|ScreenLayout$/.test(r.name)) inventory.screens.push({ line: line(n), name: r.name });
      if (direct && r.from.startsWith('@hjmds/react-native') && (/Screen$|ScreenLayout$/.test(r.name) || r.name === 'ScreenHost')) {
        // Local JSX ancestry can prove a host, but never assume a cross-file navigator supplies one.
        const hosts = [];
        let a = ts.isJsxOpeningElement(n) ? n.parent?.parent : n.parent;
        while (a) {
          const o = open(a);
          if (o && ((hjm(ref(o)) && ref(o).name === 'ScreenHost') || (ref(o).from === 'react-native-safe-area-context' && ref(o).name === 'SafeAreaView'))) {
            const edges = value(o, 'edges');
            const dynamic = o.attributes.properties.some(ts.isJsxSpreadAttribute) || (attr(o, 'edges') && !Array.isArray(edges));
            hosts.push(dynamic ? 'unknown' : !attr(o, 'edges') || edges.includes('top') ? 'top' : 'none');
          }
          a = a.parent;
        }
        if (r.name === 'ScreenHost') {
          const edges = value(n, 'edges');
          const ownTop = !n.attributes.properties.some(ts.isJsxSpreadAttribute) && (!attr(n, 'edges') || Array.isArray(edges) && edges.includes('top'));
          if (ownTop && hosts.includes('top')) add(n, 'safe-area-top-duplicate', 'violation', 'Nested ScreenHost applies the window top inset twice. Keep one top owner.');
        } else if (!hosts.includes('top')) {
          add(n, 'safe-area-top-owner', 'review', 'Native screen has no statically proven top ScreenHost/SafeAreaView ancestor. Trace route headerShown, native header/SafeAreaView, provider insets and parent layouts; safeAreaTop only pads a headerless body. Do not add a second inset when the navigator already owns it.');
        }
      }
      const control=kind(n), headerTool=inHeader(n);
      if(attr(n,'autoFocus') && value(n,'autoFocus')!==false) add(n,'input-focus-owner','review','Product autoFocus bypasses shared entry/sheet focus policy. Check explicit user-initiated focus versus mount focus.');
      if(control==='Button' && (attr(n,'selected')||attr(n,'aria-pressed'))) add(n,'selection-control','review','Selected Button: verify this is an action state, not a choice/filter/settings control requiring Chip/SegmentedControl/Switch.');
      if(control==='Button' && headerTool) add(n,'header-text-action','review','Header tool uses a text Button. Use IconButton for tools; preserve explicit final confirmation actions.');
      if(control==='IconButton' && headerTool) {
        const explicitSize=value(n,'size'), hit=value(n,'hitSlop');
        if(explicitSize && explicitSize!==contracts.topBarRecipe.action.size || hit!==undefined && hit!==contracts.topBarRecipe.action.hitSlop)
          add(n,'header-tool-size','review','Header IconButton overrides compact size/hitSlop from topBarRecipe; check adapter and header context.');
      }
      if(direct && r.name==='Stack' && rows) {
        const buttonPairs=rows.filter(row=>row.length===2 && row.every(c=>{const o=open(c);return o && kind(o)==='Button';}));
        if(buttonPairs.some(pair=>pair.every(c=>{const o=open(c);return !attr(o,'tone')||value(o,'tone')==='primary';}))) add(n,'competing-primary-actions','review','Adjacent buttons both use primary/default tone. Check one primary per action region and independent domain choices.');
        if(buttonPairs.some(pair=>{const [a,b]=pair.map(open);return value(a,'size') && value(b,'size') && value(a,'size')!==value(b,'size');})) add(n,'action-size-mismatch','review','Adjacent action buttons explicitly use different sizes; compare equal-height group contract.');
        const iconPair=rows.some(row=>row.length===2 && row.every(c=>{const o=open(c);return o && kind(o)==='IconButton';}));
        if(headerTool && iconPair) {
          const gap=value(n,'gap') ?? (!attr(n,'gap')?contracts.stackRecipe.defaults.gap:undefined);
          const actual=typeof gap==='number'?gap:contracts.spacing[gap];
          if(actual!==contracts.topBarRecipe.action.gap) add(n,'header-tool-gap','review',`Header icon group gap ${actual??'dynamic'}; topBarRecipe requires ${contracts.topBarRecipe.action.gap}.`);
        }
      }
      if (direct && /Provider$/.test(r.name)) inventory.providers.push({ line: line(n), name: r.name, brandPalette: attr(n, 'brandPalette')?.initializer?.getText() ?? null });
      if (!direct && /^[A-Z]/.test(r.jsx)) inventory.localComponents.push({ line: line(n), ...r });
      if ((r.from === 'react-native' && ['Pressable', 'TouchableOpacity', 'Modal', 'TextInput', 'ActivityIndicator'].includes(r.name)) || ['button', 'input', 'nav'].includes(r.jsx)) inventory.rawControls.push({ line: line(n), ...r });
      if (direct && r.name === 'Stack' && rows?.some(row => row.some((c, i) => action(c) && action(row[i + 1])))) {
        const gap = value(n, 'gap') ?? (!attr(n, 'gap') ? contracts.stackRecipe.defaults.gap : undefined);
        const actual = typeof gap === 'number' ? gap : contracts.spacing[gap];
        const expected = value(n, 'axis') === 'inline' ? contracts.actionGroupRecipe.inlineGap : contracts.actionGroupRecipe.stackedGap;
        const adapted = rows.some(row => row.some(wrappedAction));
        const uncertain = n.attributes.properties.some(ts.isJsxSpreadAttribute) || !!attr(n, 'style') || !!attr(n, 'layoutStyle');
        if (actual !== expected || uncertain) add(n, 'action-group-gap', actual === undefined || uncertain || adapted ? 'review' : 'violation', `Adjacent HJM actions: gap ${actual ?? 'dynamic'}, actionGroupRecipe requires ${expected}. Separate body blocks from actions.`);
      }
      if (direct && r.name === 'Stack' && parent) {
        let repeatedRow = false;
        for (const child of parent.children) if (ts.isJsxExpression(child) && child.expression && ts.isCallExpression(child.expression) && ts.isPropertyAccessExpression(child.expression.expression) && child.expression.expression.name.text === 'map') {
          const callback = child.expression.arguments[0];
          if (callback && ts.isArrowFunction(callback)) {
            const bodies = ts.isBlock(callback.body) ? callback.body.statements.filter(ts.isReturnStatement).map(s => unwrap(s.expression)) : [unwrap(callback.body)];
            for (const body of bodies) { const o = open(body); if (o && hjm(ref(o)) && ['ListRow', 'ConversationRow', 'NotificationRow'].includes(ref(o).name)) repeatedRow = true; }
          }
        }
        if (repeatedRow) add(n, 'row-rhythm', 'review', 'Stack adds spacing around repeated shared rows. Check the collection recipe; row padding already owns item rhythm.');
      }
      if (direct && ['Card', 'Surface', 'Container'].includes(r.name) && rows?.some(row => row.some(c => { const o = open(c); return o && hjm(ref(o)) && ['List', 'ConversationRow', 'NotificationRow', 'ListRow'].includes(ref(o).name); }))) {
        add(n, 'list-wrapper', 'review', `${r.name} wraps a shared list/row. Check duplicate gutter/card boundaries; domain content cards may be valid.`);
      }
      if (direct && /Screen$|ScreenLayout$/.test(r.name) && !['none','body-edge','body-bleed'].includes(value(n, 'contentInset')) && rows?.some(row => row.some(c => { const o = open(c); return o && hjm(ref(o)) && ref(o).name === 'Container' && value(o, 'gutter') !== 'none'; }))) {
        add(n, 'screen-gutter', 'review', 'Screen contains a Container gutter. Compare screen contentInset and actual body edges.');
      }
      if ((r.name === 'ScrollView' && r.from === 'react-native') || r.jsx === 'main') {
        let a = ts.isJsxOpeningElement(n) ? n.parent?.parent : n.parent;
        while (a) { const o = open(a); if (o && hjm(ref(o)) && /Screen$|ScreenLayout$/.test(ref(o).name)) { add(n, 'scroll-owner', 'review', 'Custom scrolling/main inside shared screen: verify a single scroll owner and safe-area inset.'); break; } a = a.parent; }
      }
      if (value(n, 'accessibilityRole') === 'tab' || value(n, 'role') === 'tab') add(n, 'navigation-owner', 'review', 'Product implements a tab role; verify shared navigation owns selection, keyboard and inset behavior.');
      if (!direct && (['ActivityIndicator', 'Spinner'].includes(r.name) || /EmptyState|ErrorState|LoadingState/.test(r.name))) add(n, 'state-owner', 'review', 'Product loading/empty/error component: verify shared state placement and recovery.');
      if (direct) for (const key of ['style', 'contentContainerStyle', 'containerStyle']) if (attr(n, key)) add(n, 'shared-visual-override', 'review', `${r.name}.${key}: check public prop support and recipe ownership.`);
    }
    if(ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text==='focus') add(n,'imperative-focus','review','Imperative focus: verify user action/recovery ownership; delayed/mount focus must use the shared initial-focus contract.');
    ts.forEachChild(n, visit);
  }
  visit(source);
  for (const d of source.parseDiagnostics) findings.push({line: source.getLineAndCharacterOfPosition(d.start ?? 0).line + 1, rule:'parse-incomplete', level:'review', message:ts.flattenDiagnosticMessageText(d.messageText,' ')});
  return { findings, inventory };
}
function filesBelow(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (e.name.startsWith('.') || ['node_modules', 'dist', 'build', 'coverage', 'test', 'tests', '__tests__', '__mocks__'].includes(e.name)) return [];
    const p = join(dir, e.name);
    return e.isDirectory() ? filesBelow(p) : /\.[jt]sx?$/.test(p) && !/\.(test|spec|stories)\./.test(p) ? [p] : [];
  });
}
const git = (root, args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
export function wrapperResolver(runtimeRoot) {
  const configPath = ts.findConfigFile(runtimeRoot, ts.sys.fileExists);
  const options = configPath ? ts.parseJsonConfigFileContent(ts.readConfigFile(configPath, ts.sys.readFile).config, ts.sys, dirname(configPath)).options : {};
  const cache = new Map();
  function resolveComponent(from, exported, containing, seen = new Set()) {
    if (/^@hjmds\/react(?:-native)?(?:\/|$)/.test(from)) return exported;
    const resolved = ts.resolveModuleName(from, containing, options, ts.sys).resolvedModule?.resolvedFileName;
    if (!resolved || resolved.includes('/node_modules/') || seen.has(resolved + '#' + exported)) return null;
    const key = resolved + '#' + exported;
    if (cache.has(key)) return cache.get(key);
    seen.add(key);
    const source = parse(readFileSync(resolved, 'utf8'), resolved), bindings = new Map();
    let fn;
    for (const s of source.statements) {
      if (ts.isImportDeclaration(s) && s.importClause?.namedBindings && ts.isNamedImports(s.importClause.namedBindings)) for (const b of s.importClause.namedBindings.elements) bindings.set(b.name.text, {from:s.moduleSpecifier.text, name:b.propertyName?.text ?? b.name.text});
      if (ts.isFunctionDeclaration(s) && s.name?.text === exported) fn = s;
      if (ts.isVariableStatement(s)) for(const d of s.declarationList.declarations) if(d.name.getText() === exported) fn = unwrap(d.initializer);
    }
    let result = null;
    for(const statement of source.statements) {
      if(!ts.isExportDeclaration(statement) || !statement.moduleSpecifier || !statement.exportClause || !ts.isNamedExports(statement.exportClause)) continue;
      const entry=statement.exportClause.elements.find(e=>e.name.text===exported);
      if(entry) { result=resolveComponent(statement.moduleSpecifier.text,entry.propertyName?.text??entry.name.text,resolved,new Set(seen)); break; }
    }
    // Transparent React wrappers preserve the underlying control role, not its prop values.
    while(fn && ts.isCallExpression(fn)) {
      const callee=ts.isIdentifier(fn.expression) && bindings.get(fn.expression.text);
      if(callee?.from!=='react' || !['forwardRef','memo'].includes(callee.name)) break;
      fn=unwrap(fn.arguments[0]);
    }
    if(fn && (ts.isFunctionDeclaration(fn) || ts.isFunctionExpression(fn) || ts.isArrowFunction(fn))) {
      const returns = [];
      if (fn.body && !ts.isBlock(fn.body)) returns.push(unwrap(fn.body));
      else if(fn.body) for(const s of fn.body.statements) if(ts.isReturnStatement(s) && s.expression) returns.push(unwrap(s.expression));
      const resolvedReturns = returns.map(n => {
        const o = ts.isJsxElement(n) ? n.openingElement : ts.isJsxSelfClosingElement(n) ? n : null;
        const r = o && bindings.get(o.tagName.getText());
        return r ? resolveComponent(r.from,r.name,resolved,new Set(seen)) : null;
      });
      if(resolvedReturns.length && ['Button','IconButton'].includes(resolvedReturns[0]) && resolvedReturns.every(n => n === resolvedReturns[0])) result = resolvedReturns[0];
    }
    cache.set(key,result); return result;
  }
  return (text, file) => {
    const refs = new Map(), source = parse(text,file);
    for(const s of source.statements) if(ts.isImportDeclaration(s) && s.importClause?.namedBindings && ts.isNamedImports(s.importClause.namedBindings)) for(const b of s.importClause.namedBindings.elements) {
      const name = b.propertyName?.text ?? b.name.text, from = s.moduleSpecifier.text;
      if(!from.startsWith('@hjmds/')) { const result = resolveComponent(from,name,file); if(result) refs.set(from+'#'+name,result); }
    }
    return refs;
  };
}
export function auditApp(root, contracts = readContracts()) {
  const contract = JSON.parse(readFileSync(join(root, 'app.contract.json'), 'utf8'));
  const surfaces = contract.runtimes.filter(r => ['mobile', 'web'].includes(r.kind));
  return { app: contract.app.id, sourceHead: git(root, ['rev-parse', 'HEAD']), surfaces: surfaces.map(runtime => {
    const runtimeRoot = resolve(root, runtime.root), src = join(runtimeRoot, 'src');
    const files = filesBelow(existsSync(src) ? src : runtimeRoot);
    const wrappers = wrapperResolver(runtimeRoot);
    const items = files.map(path => {
      const text = readFileSync(path, 'utf8'), result = inspectSource(text, contracts, path, wrappers(text, path)), file = relative(root, path);
      let before; try { before = git(root, ['show', `HEAD:${file}`]); } catch { /* New source has no prior version; do not invent a baseline. */ }
      if (before && before !== text) {
        const prior = inspectSource(before, contracts, path);
        if (prior.inventory.providers.some(p => p.brandPalette) && !result.inventory.providers.some(p => p.brandPalette)) result.findings.push({ line: 1, rule: 'theme-connection-removed', level: 'review', message: 'Previously wired product brandPalette is absent. Verify intended product theme before accepting.' });
        if (!before.includes('THEMES') && /THEMES\.(light|dark)/.test(text) && /BRAND_PALETTE|brandPalette/.test(text)) result.findings.push({ line: 1, rule: 'theme-replaced-with-default', level: 'review', message: 'Product palette changed to HJM defaults since HEAD; product authorization is required, not implied by layout standardization.' });
      }
      return { file, sha256: createHash('sha256').update(text).digest('hex'), ...result };
    });
    return { kind: runtime.kind, root: runtime.root, status: files.length ? 'source-scanned' : 'unavailable', items };
  }) };
}
export function reviewFreshness(report, root) {
  const rows=[...(report.candidateReview?.items??[]),...(report.headerSafetyAudit?.items??[]),...(report.extendedReview?.items??[])];
  return rows.map(row=>{
    const checks=[{file:`apps/${row.app}/${row.file}`,sha256:row.reviewedSha256},...(row.evidence??[])];
    const changed=checks.filter(e=>{
      const path=resolve(root,e.file);
      if(!path.startsWith(resolve(root)+'/') || !e.sha256 || !existsSync(path)) return true;
      return createHash('sha256').update(readFileSync(path)).digest('hex')!==e.sha256;
    }).map(e=>e.file);
    return {app:row.app,file:row.file,line:row.originalLine??row.line,rule:row.rule,previousStatus:row.status,
      status:changed.length?'stale':row.evidence?.length?'source-unchanged':'dependencies-unrecorded',changed};
  });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [target, output] = process.argv.slice(2);
  if (!target || !output) throw new Error('Usage: node scripts/audit-consumer-ui.mjs <app-root|portfolio-root> <output.json> [--check] [--reviews <portfolio-report.json>]');
  const root = resolve(target), contracts = readContracts();
  const entries = existsSync(join(root, 'portfolio.json')) ? JSON.parse(readFileSync(join(root, 'portfolio.json'), 'utf8')).apps.map(a => ({ id: a.id, root: resolve(root, a.path), archived: a.lifecycle === 'archived' && a.checkout === 'absent' })) : [{ root }];
  const apps = entries.map(e => { if(e.archived) return {app:e.id,status:'excluded-archived',reason:'portfolio.json declares archived, absent checkout'}; try { return auditApp(e.root, contracts); } catch (error) { return { app: e.id ?? e.root, status: 'unavailable', error: error.message }; } });
  const counts = apps.map(a => ({ app: a.app, status: a.status, surfaces: a.surfaces?.map(s => ({ kind: s.kind, files: s.items.length, violations: s.items.flatMap(i => i.findings).filter(f => f.level === 'violation').length, review: s.items.flatMap(i => i.findings).filter(f => f.level === 'review').length })) }));
  const reviewIndex=process.argv.indexOf('--reviews');
  if(reviewIndex>=0 && (!existsSync(join(root,'portfolio.json')) || !process.argv[reviewIndex+1])) throw new Error('--reviews requires a portfolio root and a report path');
  const reviews=reviewIndex<0?undefined:reviewFreshness(JSON.parse(readFileSync(resolve(process.argv[reviewIndex+1]),'utf8')),root);
  const result = { reviewFreshness:reviews, schemaVersion: 3, generatedAt: new Date().toISOString(), contracts, scope: 'Registered mobile/web source files. Direct HJM imports and namespaces, fragments and conditional branches. Local/imported wrappers, dynamic styles, CSS, portals and runtime geometry require review; source-scanned is not visual compliance.', apps, counts };
  writeFileSync(resolve(output), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(counts, null, 2));
  // Explicit developer check only; never added to deployment CI. Missing scopes cannot pass.
  if (process.argv.includes('--check')) process.exitCode = apps.some(a => a.status === 'unavailable' || a.surfaces?.some(s => s.status === 'unavailable')) ? 2 : counts.some(a => a.surfaces?.some(s => s.violations)) ? 1 : 0;
}
