import { createRequire } from 'node:module';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
// Use the consumer's parser: TSX import aliases cannot be resolved reliably by tag regex.
const [appRoot, output] = process.argv.slice(2);
if (!appRoot || !output) throw new Error('Usage: node scripts/audit-consumer-ui.mjs <app-root> <output.json>');
const root = resolve(appRoot);
const require=createRequire(join(root,'package.json'));
const ts=require('typescript');
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);}
const rows=[];
for(const path of walk(join(root,'apps/mobile/src')).filter(p=>p.endsWith('.tsx'))){
 const text=readFileSync(path,'utf8');const source=ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const imports=new Map();const namespaces=new Map();
 for(const statement of source.statements){
  if(!ts.isImportDeclaration(statement)||!ts.isStringLiteral(statement.moduleSpecifier)||statement.importClause?.isTypeOnly)continue;
  const from=statement.moduleSpecifier.text,bindings=statement.importClause?.namedBindings;
  if(statement.importClause?.name)imports.set(statement.importClause.name.text,{from,name:'default'});
  if(bindings&&ts.isNamedImports(bindings))for(const item of bindings.elements)if(!item.isTypeOnly)imports.set(item.name.text,{from,name:item.propertyName?.text??item.name.text});
  if(bindings&&ts.isNamespaceImport(bindings))namespaces.set(bindings.name.text,from);
 }
 const tags=new Map();
 function visit(node){if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)){
  const name=node.tagName.getText(source);let ref=imports.get(name);if(!ref&&name.includes('.')){const [prefix,member]=name.split('.');if(namespaces.has(prefix))ref={from:namespaces.get(prefix),name:member};}
  const key=ref?`${ref.from}#${ref.name}`:`local#${name}`;if(!tags.has(key))tags.set(key,{...ref,jsx:name,count:0,lines:[]});const hit=tags.get(key);hit.count++;hit.lines.push(source.getLineAndCharacterOfPosition(node.getStart(source)).line+1);
 }ts.forEachChild(node,visit);}
 visit(source);
 rows.push({file:relative(root,path),sha256:createHash('sha256').update(text).digest('hex'),renderedTags:[...tags.values()],review:'pending',decision:null});
}
const result={schemaVersion:1,sourceHead:execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),scope:'All TSX under apps/mobile/src, source inventory only; no behavioral replacement or transitive-compliance claim.',items:rows};
writeFileSync(resolve(output),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({files:rows.length,nativeInteractive:rows.filter(r=>r.renderedTags.some(t=>t.from==='react-native'&&['Modal','Pressable','TextInput','TouchableOpacity','ActivityIndicator'].includes(t.name))).map(r=>({file:r.file,tags:r.renderedTags.filter(t=>t.from==='react-native').map(t=>t.name)}))},null,2));
