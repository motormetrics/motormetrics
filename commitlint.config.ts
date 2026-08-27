import { RuleConfigSeverity, type UserConfig } from "@commitlint/types";

const configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [RuleConfigSeverity.Error, "always", 72],
    "subject-case": [
      RuleConfigSeverity.Error,
      "never",
      ["sentence-case", "start-case", "pascal-case", "upper-case"],
    ],
    "type-enum": [
      RuleConfigSeverity.Error,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
      ],
    ],
    "scope-enum": [
      RuleConfigSeverity.Error,
      "always",
      ["ai", "database", "docs", "logos", "mcp", "types", "utils", "web"],
    ],
    "body-max-line-length": [RuleConfigSeverity.Disabled, "always"],
    "footer-leading-blank": [RuleConfigSeverity.Disabled, "always"],
    "footer-max-line-length": [RuleConfigSeverity.Disabled, "always"],
  },
};

export default configuration;
