import { describe, expect, it } from "vitest";
import { filterBranches, parseRemoteUrl } from "../src/git-client.js";

describe("git-client", () => {
  it("should parse https remote url", () => {
    expect(parseRemoteUrl("https://github.example.com/team/repo.git")).toEqual({
      host: "github.example.com",
      owner: "team",
      repo: "repo"
    });
  });

  it("should parse ssh remote url", () => {
    expect(parseRemoteUrl("git@github.example.com:team/repo.git")).toEqual({
      host: "github.example.com",
      owner: "team",
      repo: "repo"
    });
  });

  it("should filter branches by keyword", () => {
    const result = filterBranches(
      [
        { name: "feature/auth", kind: "local", hash: "abc123", committedAt: "2026-01-01", subject: "add auth" },
        { name: "release/v1", kind: "remote", hash: "def456", committedAt: "2026-01-02", subject: "release prep" }
      ],
      "auth"
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("feature/auth");
  });
});
