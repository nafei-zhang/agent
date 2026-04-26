import { describe, expect, it } from "vitest";
import { parseRepoFromRemote } from "../src/git-client.js";

describe("git-client", () => {
  it("should parse https remote", () => {
    expect(parseRepoFromRemote("https://github.example.com/team/repo.git")).toEqual({
      host: "github.example.com",
      owner: "team",
      repo: "repo"
    });
  });

  it("should parse ssh remote", () => {
    expect(parseRepoFromRemote("git@github.example.com:team/repo.git")).toEqual({
      host: "github.example.com",
      owner: "team",
      repo: "repo"
    });
  });
});
