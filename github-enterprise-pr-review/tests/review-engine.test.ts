import { describe, expect, it } from "vitest";
import { generateReviewResult } from "../src/review-engine.js";

describe("review-engine", () => {
  it("should detect risky patterns", () => {
    const result = generateReviewResult({
      templateLanguage: "JavaScript",
      files: [
        {
          filename: "src/a.js",
          status: "modified",
          additions: 10,
          deletions: 1,
          changes: 11,
          patch: "+ eval(userInput)\n+ // TODO remove later"
        }
      ]
    });
    expect(result.issues.some((i) => i.severity === "Critical")).toBe(true);
    expect(result.issues.some((i) => i.severity === "Major")).toBe(true);
  });

  it("performance: should handle large file list quickly", () => {
    const files = Array.from({ length: 1500 }).map((_, i) => ({
      filename: `src/f${i}.ts`,
      status: "modified",
      additions: 1,
      deletions: 0,
      changes: 1,
      patch: "+ const x = 1;"
    }));
    const start = Date.now();
    const result = generateReviewResult({ templateLanguage: "TypeScript", files });
    const elapsed = Date.now() - start;
    expect(result.summary.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(2000);
  });
});
