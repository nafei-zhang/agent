import { describe, expect, it } from "vitest";
import { formatReviewMarkdown, splitCommentBody } from "../src/formatter.js";
import { generateReviewResult } from "../src/review-engine.js";

describe("integration-flow", () => {
  it("should generate markdown and split for publishing", () => {
    const review = generateReviewResult({
      templateLanguage: "TypeScript",
      files: [
        {
          filename: "src/a.ts",
          status: "modified",
          additions: 300,
          deletions: 10,
          changes: 310,
          patch: "+ console.log('debug')\n+ // TODO"
        }
      ]
    });
    const markdown = formatReviewMarkdown(review);
    const chunks = splitCommentBody(markdown, 500);
    expect(markdown).toContain("PR Review Report");
    expect(chunks.length).toBeGreaterThanOrEqual(1);
  });
});
