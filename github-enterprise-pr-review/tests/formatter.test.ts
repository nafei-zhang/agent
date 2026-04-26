import { describe, expect, it } from "vitest";
import { formatReviewMarkdown, splitCommentBody } from "../src/formatter.js";

describe("formatter", () => {
  it("should format markdown with severity sections", () => {
    const markdown = formatReviewMarkdown({
      templateLanguage: "TypeScript",
      summary: "summary",
      positives: ["good"],
      issues: [
        { severity: "Critical", title: "c1", suggestion: "fix" },
        { severity: "Major", title: "m1", suggestion: "fix" },
        { severity: "Minor", title: "n1", suggestion: "fix" }
      ]
    });
    expect(markdown).toContain("### Critical");
    expect(markdown).toContain("### Major");
    expect(markdown).toContain("### Minor");
  });

  it("should split long markdown into chunks", () => {
    const body = `# title\n${"A".repeat(130000)}`;
    const chunks = splitCommentBody(body, 60000);
    expect(chunks.length).toBeGreaterThan(2);
    expect(chunks.join("").length).toBeGreaterThan(100000);
  });
});
