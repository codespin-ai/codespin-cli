// getDiff.ts

import { promises as fs } from "fs";
import { execString } from "../process/execString.js";
import { createTempFile } from "../fs/createTempFile.js";
import path from "path";
import { getWorkingDir } from "../fs/workingDir.js";

export async function getDiff(
  newContent: string,
  oldContent: string,
  filename: string
): Promise<string> {
  const tempPathCurrent = await createTempFile(newContent);
  const tempPathCommitted = await createTempFile(oldContent);

  try {
    const diff = await execString(
      `git diff --no-index ${tempPathCommitted} ${tempPathCurrent}`,
      getWorkingDir()
    );

    return diff
      .replaceAll(
        `${tempPathCommitted}`,
        `/${path.relative(getWorkingDir(), filename)}`
      )
      .replaceAll(
        `${tempPathCurrent}`,
        `/${path.relative(getWorkingDir(), filename)}`
      );
  } finally {
    await Promise.all([
      fs.unlink(tempPathCurrent),
      fs.unlink(tempPathCommitted),
    ]);
  }
}
