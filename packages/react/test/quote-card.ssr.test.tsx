import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { QuoteCard } from "../src/display.js";
it("keeps quotation semantics, caption order and independent child controls", () => {
 const html = renderToStaticMarkup(<QuoteCard attribution="Author · today"><p>Quotation</p><button>Read original</button></QuoteCard>);
 expect(html).toContain('<blockquote class="hjm-quote-card__body">');
 expect(html.indexOf("Quotation")).toBeLessThan(html.indexOf("Author · today"));
 expect(html.match(/<button/gu)).toHaveLength(1);
 expect(html).toContain('class="hjm-quote-card__mark" aria-hidden="true"');
});
