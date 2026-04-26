import { describe, expect, it } from "vitest";
import { buildCommitMessage, validateCommitMessage } from "../src/conventional-commits.js";

describe("conventional commits", () => {
  it("should build message with scope", () => {
    const msg = buildCommitMessage({
      type: "feat",
      scope: "auth",
      description: "add enterprise oauth callback"
    });
    expect(msg).toBe("feat(auth): add enterprise oauth callback");
  });

  it("should build message without scope", () => {
    const msg = buildCommitMessage({
      type: "fix",
      description: "handle empty diff before commit"
    });
    expect(msg).toBe("fix: handle empty diff before commit");
  });

  it("should validate message", () => {
    expect(validateCommitMessage("docs(cli): improve usage guide")).toBe(true);
    expect(validateCommitMessage("bad message")).toBe(false);
  });
});
