import { describe, it, test, expect, beforeAll } from "vitest";
import {
  initDocumentState,
  parseDocument,
  extractMediaWidth,
} from "../src/parse";
import path from "path";
import { JSDOM } from "jsdom";
import { formatHtmlStylesToInlineStyles } from "./utils";
import { DocumentState } from "../src/parse.types";
import { CSSRule } from "../shared/parse";

const documentTestCases: {
  document: Document | null;
  expected: DocumentState;
}[] = [
  {
    document: null,
    expected: { breakpoints: [375, 768, 1024], baseline: 375 },
  },
];

documentTestCases.forEach((testCase, index) => {
  const htmlPath = path.join(
    __dirname,
    `material/document/${index + 1}/index.html`
  );
  const rootHtml = formatHtmlStylesToInlineStyles(htmlPath);
  const dom = new JSDOM(rootHtml);
  const document = dom.window.document;
  testCase.document = document;
});

describe("parseDocument", () => {
  test.each(documentTestCases)(
    "should parse document",
    ({ document, expected }) => {
      expect(document).not.toBeNull();
      if (!document) return;
      const parsedDocument = parseDocument(document);

      expect(parsedDocument).toEqual(
        expect.objectContaining({ breakpoints: expected.breakpoints })
      );
    }
  );
});

describe("initDocumentState", () => {
  test.each(documentTestCases)(
    "should initialize document state",
    ({ document, expected }) => {
      expect(document).not.toBeNull();
      if (!document) return;
      const parsedDocument = initDocumentState(document);

      expect(parsedDocument).toEqual(expected);
    }
  );
});

const ruleTestCases = [
  {
    rule: {
      type: CSSRule.MEDIA_RULE,
      media: { mediaText: "(min-width: 375px)" },
      cssRules: [],
    } as unknown as CSSMediaRule,
    expected: { width: 375, isBaseline: true },
  },
  {
    rule: {
      type: CSSRule.MEDIA_RULE,
      media: { mediaText: "(min-width: 375px)" },
      cssRules: [{ type: CSSRule.STYLE_RULE, cssText: "font-size: 16px;" }],
    } as unknown as CSSMediaRule,
    expected: { width: 375, isBaseline: false },
  },
];

describe("processRule", () => {
  test.each(ruleTestCases)(
    "should process valid rule",
    ({ rule, expected }) => {
      const result = extractMediaWidth(rule);
      expect(result).toEqual(expected);
    }
  );
});
