import path from "path";
import { exception } from "../exception.js";
import { pathExists } from "../fs/pathExists.js";
import { getTemplatesDir } from "../settings/getTemplatesDir.js";
import declarationsTemplate from "../templates/declarations.js";
import defaultTemplate from "../templates/default.js";
import dependenciesTemplate from "../templates/dependencies.js";
import diffTemplate from "../templates/diff.js";
import plainTemplate from "../templates/plain.js";

export async function getTemplate<T>(
  template: string | undefined,
  templateType: "plain" | "declarations" | "default" | "dependencies" | "diff",
  customConfigDir: string | undefined,
  workingDir: string
): Promise<(args: T) => Promise<string>> {
  const projectTemplateDir = await getTemplatesDir(customConfigDir, workingDir);

  const templatePath =
    template && (await pathExists(template))
      ? template
      : projectTemplateDir &&
        (await pathExists(
          path.join(projectTemplateDir, template || `${templateType}.mjs`)
        ))
      ? path.join(projectTemplateDir, template || `${templateType}.mjs`)
      : undefined;

  if (templatePath) {
    const template = await import(templatePath);
    return template.default;
  } else {
    return templateType === "plain"
      ? (plainTemplate as (args: T) => Promise<string>)
      : templateType === "default"
      ? (defaultTemplate as (args: T) => Promise<string>)
      : templateType === "declarations"
      ? (declarationsTemplate as (args: T) => Promise<string>)
      : templateType === "dependencies"
      ? (dependenciesTemplate as (args: T) => Promise<string>)
      : templateType === "diff"
      ? (diffTemplate as (args: T) => Promise<string>)
      : exception(
          `The template ${template || `${templateType}.mjs`} was not found.`
        );
  }
}
