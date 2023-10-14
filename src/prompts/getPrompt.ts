import { readFile } from "fs/promises";
import { exception } from "../exception.js";
import { getDiff } from "../git/getDiff.js";
import { getFileFromCommit } from "../git/getFileFromCommit.js";
import { isCommitted } from "../git/isCommitted.js";
import { addLineNumbers } from "../text/addLineNumbers.js";
import { processPrompt } from "./processPrompt.js";

export async function getPrompt(
  promptFile: string | undefined,
  immediatePrompt: string | undefined,
): Promise<{
  prompt: string;
  promptWithLineNumbers: string;
  previousPrompt: string | undefined;
  previousPromptWithLineNumbers: string | undefined;
  promptDiff: string | undefined;
}> {
  if (promptFile) {
    const rawContents = await readFile(promptFile, "utf-8");
    const prompt = await processPrompt(rawContents);
    const promptWithLineNumbers = addLineNumbers(prompt);

    const isPromptFileCommitted = promptFile
      ? await isCommitted(promptFile)
      : false;

    const { previousPrompt, previousPromptWithLineNumbers, promptDiff } =
      isPromptFileCommitted
        ? await (async () => {
            if (promptFile) {
              const fileFromCommit = await getFileFromCommit(promptFile);
              const previousPrompt =
                fileFromCommit !== undefined
                  ? await processPrompt(fileFromCommit)
                  : undefined;
              const previousPromptWithLineNumbers =
                previousPrompt !== undefined
                  ? addLineNumbers(previousPrompt)
                  : undefined;
              const promptDiff =
                previousPrompt !== undefined
                  ? await getDiff(prompt, previousPrompt, promptFile)
                  : undefined;
              return {
                previousPrompt,
                previousPromptWithLineNumbers,
                promptDiff,
              };
            } else {
              exception("invariant exception: missing prompt file");
            }
          })()
        : {
            previousPrompt: "",
            previousPromptWithLineNumbers: "",
            promptDiff: "",
          };
    return {
      prompt,
      promptWithLineNumbers,
      previousPrompt,
      previousPromptWithLineNumbers,
      promptDiff,
    };
  } else if (immediatePrompt) {
    const prompt = immediatePrompt;
    const promptWithLineNumbers = addLineNumbers(prompt);
    return {
      prompt,
      promptWithLineNumbers,
      previousPrompt: undefined,
      previousPromptWithLineNumbers: undefined,
      promptDiff: undefined,
    };
  } else {
    exception(
      "The prompt file must be specified. See 'codespin generate help'."
    );
  }
}
