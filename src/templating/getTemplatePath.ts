import path from "path";
import { pathExists } from "../fs/pathExists.js";
import { fileURLToPath } from "url";
import { getTemplatesDirectory } from "../fs/codespinPaths.js";

export async function getTemplatePath(
  template: string | undefined,
  localFallback: string
): Promise<string> {
  const globalFallback = localFallback.replace(/\.mjs$/, ".js");
  // If the template is not provided, we'll use the fallbacks
  const projectTemplateDir = await getTemplatesDirectory();
  
  const templatePath =
    template && (await pathExists(template))
      ? template
      : projectTemplateDir && (await pathExists(
          path.join(projectTemplateDir, template || localFallback)
        ))
      ? path.join(projectTemplateDir, template || localFallback)
      : await (async () => {
          const __filename = fileURLToPath(import.meta.url);
          const builtInTemplatesDir = path.resolve(
            __filename,
            "../../templates"
          );
          const builtInTemplatePath = path.resolve(
            builtInTemplatesDir,
            globalFallback
          );
          return (await pathExists(builtInTemplatePath))
            ? builtInTemplatePath
            : undefined;
        })();

  if (!templatePath) {
    throw new Error(
      `The template ${templatePath} was not found. Have you done 'codespin init'?`
    );
  }

  return templatePath;
}
