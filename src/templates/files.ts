import path from "path";
import { VersionedFileInfo } from "../fs/VersionedFileInfo.js";
import { CodespinConfig } from "../settings/CodespinConfig.js";
import { addLineNumbers } from "../text/addLineNumbers.js";
import { FilesTemplateArgs } from "./FilesTemplateArgs.js";
import { FilesTemplateResult } from "./FilesTemplateResult.js";

export default async function filesTemplate(
  args: FilesTemplateArgs,
  config: CodespinConfig,
  context: CodespinConfig
): Promise<FilesTemplateResult> {
  const prompt =
    printLine(args.prompt, true) +
    printIncludeFiles(args.includes, args.workingDir, false);

  return { prompt };
}

function printLine(line: string | undefined, addBlankLine = false): string {
  return line
    ? line + (!line.endsWith("\n") ? "\n" : "") + (addBlankLine ? "\n" : "")
    : "\n";
}

function relativePath(filePath: string, workingDir: string) {
  return "./" + path.relative(workingDir, filePath);
}

function printIncludeFiles(
  includes: VersionedFileInfo[],
  workingDir: string,
  useLineNumbers: boolean
) {
  if (includes.length === 0) {
    return "";
  } else {
    const text =
      printLine(
        useLineNumbers
          ? "Including relevant files below with line numbers added:"
          : "Including relevant files below:",
        true
      ) +
      includes
        .map((file) => {
          if (file.type === "diff") {
            const text =
              // Print the contents first
              printLine(
                `Contents of the file ${relativePath(file.path, workingDir)}:`
              ) +
              printLine("```") +
              printLine(addLineNumbers(file.version2 ?? "")) +
              printLine("```", true) +
              printLine("") +
              // Print the diff
              (file.diff.trim().length > 0)
                ? printLine(
                    `Also included below is the diff for the same file ${relativePath(
                      file.path,
                      workingDir
                    )} to help you understand the changes:`
                  ) +
                  printLine("```") +
                  printLine(file.diff) +
                  printLine("```", true)
                : "";

            return text;
          } else {
            if (file.contents && file.contents.trim().length > 0) {
              const text =
                printLine(
                  `Contents of the file ${relativePath(file.path, workingDir)}:`
                ) +
                printLine("```") +
                printLine(
                  useLineNumbers ? addLineNumbers(file.contents) : file.contents
                ) +
                printLine("```", true);

              return text;
            } else {
              return "";
            }
          }
        })
        .join("\n");
    return text;
  }
}
