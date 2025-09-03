import { DocumentState, ParsedDocument } from "./parse.types";
import { CSSRule } from "../shared/parse";
/**
 * Parses the CSS document model.
 *
 * @param {Document} document - The CSS document to parse.
 * @returns {ParsedDocument} The parsed document, including:
 * - `breakpoints` — Unique breakpoints (e.g., 375, 768, 1024).
 * - `fluidData` — Properties and their values at each breakpoint,
 *   used by the engine to interpolate values between breakpoints.
 */
function parseDocument(document: Document): ParsedDocument {
  const { breakpoints, baseline } = initDocumentState(document);

  return {
    breakpoints,
  };
}

/**
 * Initializes the document state.
To do this, we analyze all the media rules in the document. We can determine this global document state by:
1.  Retrieving all media rules that have min-width into a Set(for uniqueness).
2.  Finding media rule that has min-width and is empty (no style rules). An empty media rule is useless, so we assume this is the global baseline definer.
 *
 * @param {Document} document - The CSS document to initialize the state for.
 * @returns {DocumentState} The document state, including:
 * - `breakpoints` — Unique breakpoints (e.g., 375, 768, 1024).
 * - `baseline` — Global baseline width (typically 375). This makes it easy for the user to define the baseline just once for the whole page/project/etc.
 */
function initDocumentState(document: Document): DocumentState {
  const breakpoints = new Set<number>();
  let baseline: number = -1;

  for (const sheet of document.styleSheets) {
    for (const rule of sheet.cssRules) {
      const result = extractMediaWidth(rule);
      if (result) {
        if (result.isBaseline) baseline = result.width;
        breakpoints.add(result.width);
      }
    }
  }

  if (baseline === -1) throw Error("No baseline found");

  return { breakpoints: Array.from(breakpoints), baseline };
}

/**
 * Processes a CSS rule, extracting:
 * 1) The width of the rule, used as a breakpoint
 * 2) Whether the rule is a baseline, to use as the global baseline
 */
function extractMediaWidth(
  rule: CSSRule
): { width: number; isBaseline: boolean } | null {
  if (rule.type === CSSRule.MEDIA_RULE) {
    const mediaRule = rule as CSSMediaRule;
    const mediaText = mediaRule.media.mediaText;
    if (mediaText.includes("min-width")) {
      const minWidthMatch = mediaText.match(/\(min-width:\s*(\d+)px\)/);
      if (minWidthMatch) {
        const minWidth = Number(minWidthMatch[1]);
        const isBaseline = mediaRule.cssRules.length === 0;
        const width = minWidth;
        return { width, isBaseline };
      }
    }
  }
  return null;
}

export { parseDocument, initDocumentState, extractMediaWidth };
