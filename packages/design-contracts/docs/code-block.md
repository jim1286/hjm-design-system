# Code block

Reviewed: 2026-10-07. Optional `/code-block` entries in both renderers expose
`CodeBlock`. This is a source preview, not an editor or executable HTML renderer.
The visual integration request required syntax presentation without another input
or clipboard engine, so source validation belongs to contracts and actions are slots.

Pass `code`, a localized `label`, optional `language`, `wrap` and `tokens`.
Tokens have `{text, tone?}` where tone is plain, keyword, string, comment or number.
Their text must concatenate to the original code exactly, including whitespace;
invalid output throws. Use a product-selected highlighter to generate tokens.
No parser, remote highlighting service, raw HTML or execution is included. The
semantic palette supplies readable token colors; string/plain may share a color.

Long lines scroll horizontally by default. `wrap` opts into wrapping. On Web the
preformatted source is keyboard-focusable and selectable; on Native it uses a
selectable Text inside the existing horizontal ScrollView. The Native accessible
name includes the original source as well as its label, so naming does not hide code.

`copyAction` accepts an existing product control. Web can pass HJM ClipboardButton
with `value={code}`, localized idle/copied labels and a visible `onCopyError` response.
Native can use system text selection directly or supply the product's clipboard
button. No Expo clipboard peer is pulled into the generic renderer. The Native
showcase demonstrates actual system selection; it does not fake a copied state.

Both showcases register `컴포넌트/데이터 표시/Code Block`. Contract tests reject altered
highlight text; browser tests check literal script text, focus and wrapping; Native
host tests check selectable content and scroll/wrap composition. The
[Native flow audit](../../../docs/evidence/component-flows-2026-10-01/README.md) verifies
200% controlled text scaling and actual iOS simulator long-press Copy, with exact
source/clipboard equality. Header and source use the common text-scale helper;
token spans inherit once. Android clipboard and physical-device verification remain separate.


The product design profile supplies `tokens.fontFamily.code` and `tokens.typography.body`
to both source hosts. Syntax spans inherit those metrics and the original code remains
unchanged. Native translates the default generic monospace intent to Menlo on iOS and
monospace on Android; custom font installation stays with the product. The source is
LTR inside an RTL shell: an actual RTL comparison moved the trailing semicolon to the
beginning of the displayed statement. Localized headings and surrounding controls retain
the product direction. This is a reading-order decision, not a source-text rewrite.

Native 제목은 제품 UI font, 원문과 span은 code font를 읽는다. 두 역할은 같은 내부 플랫폼 font 해석을 공유하며, 제목이 OS 서체로 남던 경로를 보완했다. 실제 font 등록은 제품이 맡는다.
