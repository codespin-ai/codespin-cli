export type CodespinConfig = {
  template?: string;
  model?: string;
  maxTokens?: number;
  maxDeclare?: number;
  models?: {
    [key: string]: string;
  };
  markers?: {
    START_UPDATES: string;
    END_UPDATES: string;
    START_FILE_CONTENTS: string;
    END_FILE_CONTENTS: string;
  };
};
