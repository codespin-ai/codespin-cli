import ts from "typescript";
import path from "path";
import fs from "fs";
import { Dependency } from "../commands/deps.js";

export async function getDependencies(
  srcPath: string,
  workingDir: string
): Promise<Dependency[]> {
  const fullPath = path.resolve(srcPath);
  const fileContent = fs.readFileSync(fullPath, "utf8");
  const sourceFile = ts.createSourceFile(
    fullPath,
    fileContent,
    ts.ScriptTarget.ES2015,
    true
  );

  const dependencies: Dependency[] = [];

  function resolveFilePath(basePath: string, importPath: string): string {
    const extensions = [".js", ".jsx", ".ts", ".tsx"];
    let resolvedPath = path.resolve(path.dirname(basePath), importPath);

    // Remove original extension if present
    resolvedPath = resolvedPath.replace(/\.[^/.]+$/, "");

    // Check if resolvedPath is a directory
    if (
      fs.existsSync(resolvedPath) &&
      fs.statSync(resolvedPath).isDirectory()
    ) {
      for (let ext of extensions) {
        let indexPath = path.join(resolvedPath, `index${ext}`);
        if (fs.existsSync(indexPath)) {
          return indexPath;
        }
      }
    } else {
      // Try appending extensions to see if the file exists
      for (let ext of extensions) {
        let testPath = `${resolvedPath}${ext}`;
        if (fs.existsSync(testPath)) {
          return testPath;
        }
      }
    }

    // If no file is found, fallback to the original path (this may be an external module path)
    return resolvedPath;
  }

  function visit(node: ts.Node) {
    if (
      ts.isImportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const importPath = node.moduleSpecifier.text;
      let isProjectFile = false;

      let resolvedPath = "";
      if (importPath.startsWith(".") || importPath.startsWith("..")) {
        resolvedPath = resolveFilePath(fullPath, importPath);
        isProjectFile = true;
      } else {
        // Simplified handling for node_modules or external modules
        resolvedPath = `node_modules/${importPath}`;
        isProjectFile = false;
      }

      dependencies.push({
        dependency: importPath,
        filePath: path.relative(workingDir, resolvedPath),
        isProjectFile: isProjectFile,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return dependencies;
}