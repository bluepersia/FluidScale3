import path from "path";
import { readFileSync } from "fs";

function formatHtmlStylesToInlineStyles(htmlFilePath: string): string {
  const html = readFileSync(htmlFilePath, "utf8");

  const cssFilePaths = [...html.matchAll(/<link[^>]*href="([^"]+)"[^>]*>/g)]
    .map((relativePathMatch) => {
      const relativePath = relativePathMatch[1];
      if (/^(https?:)?\/\//.test(relativePath)) {
        // External URL or CDN
        return null;
      }
      if (relativePath.startsWith("./"))
        return path.resolve(path.dirname(htmlFilePath), relativePath);
    })
    .filter((notNull) => notNull !== null && notNull !== undefined);

  let result = "<!DOCTYPE html><html><head>";

  for (const cssFilePath of cssFilePaths) {
    const cssContent = readFileSync(cssFilePath, "utf8");
    result += `<style>${cssContent}</style>`;
  }

  result += "</head><body></body></html>";

  return result;
}

export { formatHtmlStylesToInlineStyles };
