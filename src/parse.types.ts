type ParsedDocument = {
  breakpoints: number[];
};

type DocumentState = {
  breakpoints: number[];
  baseline: number;
};

export { ParsedDocument, DocumentState };
