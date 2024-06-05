import { CodeSpinContext } from "../CodeSpinContext.js";
import { setDebugFlag } from "../debugMode.js";
import { BuildPromptArgs, buildPrompt } from "../prompts/buildPrompt.js";
import { readCodeSpinConfig } from "../settings/readCodeSpinConfig.js";

export type FormatPromptArgs = {
  promptFile?: string;
  prompt?: string;
  template?: string;
  debug?: boolean;
  config?: string;
  include?: string[];
  exclude?: string[];
  spec?: string;
};

export type FormatPromptResult = {
  prompt: string;
};

export async function formatPrompt(
  args: FormatPromptArgs,
  context: CodeSpinContext
): Promise<FormatPromptResult> {
  if (args.debug) {
    setDebugFlag();
  }

  const config = await readCodeSpinConfig(args.config, context.workingDir);

  if (config.debug) {
    setDebugFlag();
  }

  const buildPromptArgs: BuildPromptArgs = {
    exclude: args.exclude ?? [],
    include: args.include ?? [],
    prompt: args.prompt,
    promptFile: args.promptFile,
    spec: args.spec,
    template: args.template ?? "files",
    customConfigDir: args.config,
  };

  const result = await buildPrompt(buildPromptArgs, config, context);

  return result;
}
