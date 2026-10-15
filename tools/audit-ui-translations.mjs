import fs from "node:fs"
import path from "node:path"
import ts from "typescript"

// Static audit of interface copy. Runtime database content is outside its scope.
const translated = []
const candidates = []
const attributes = new Set(["placeholder", "title", "aria-label", "alt", "label"])
const technical = /^(DSC|\(DSC\)|CMS|HTML|MB|SAR|SA\d+|X|url-slug|family-support|dd-mm-yyyy|https?:.*|.*@.*|www\..*|\/portal\/|&\w+;)$/

function scan(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) scan(file)
    else if (file.endsWith(".tsx")) {
      const source = fs.readFileSync(file, "utf8")
      const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
      function record(node, text, kind, list) {
        list.push({ file: file.replaceAll("\\", "/"), line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1, text, kind })
      }
      function visit(node) {
        if (ts.isCallExpression(node) && node.expression.getText(tree) === "ui") {
          const arg = node.arguments[0]
          record(node, arg && ts.isStringLiteral(arg) ? arg.text : arg?.getText(tree) ?? "", "translated", translated)
        }
        if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(tree) === "LocalizedText") {
          const attr = node.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.getText(tree) === "text")
          if (attr?.initializer) record(node, attr.initializer.getText(tree), "translated", translated)
        }
        let text
        let kind
        if (ts.isJsxText(node)) {
          text = node.text.trim().replace(/\s+/g, " ")
          kind = "text"
        } else if (ts.isJsxAttribute(node) && attributes.has(node.name.getText(tree)) && node.initializer && ts.isStringLiteral(node.initializer)) {
          text = node.initializer.text
          kind = node.name.getText(tree)
        }
        if (text && /[A-Za-z]{2}/.test(text) && !/[\u0600-\u06ff]/.test(text)) {
          // These are deliberately English-only branch copy or development text.
          const intentional = file.replaceAll("\\", "/") === "components/landing/HeroSection.tsx" || file.replaceAll("\\", "/") === "components/dev/DevBanner.tsx"
          if (!intentional && !technical.test(text)) record(node, text, kind, candidates)
        }
        ts.forEachChild(node, visit)
      }
      visit(tree)
    }
  }
}

scan("app")
scan("components")
const report = { translatedOccurrences: translated.length, translatedFiles: new Set(translated.map(x => x.file)).size, translated, candidates }
if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2))
else {
  console.log(`Localized copy: ${report.translatedOccurrences} occurrences in ${report.translatedFiles} files.`)
  console.log("Remaining static English candidates (review technical identifiers and examples):")
  for (const item of candidates) console.log(`${item.file}:${item.line} [${item.kind}] ${item.text}`)
}
