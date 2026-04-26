import { describe, expect, it } from "vitest";
import { normalizeEnterpriseApiUrl } from "../src/config-manager.js";

describe("config-manager", () => {
  it("should normalize host to api path", () => {
    expect(normalizeEnterpriseApiUrl("https://github.example.com")).toBe("https://github.example.com/api/v3");
  });

  it("should keep existing api path", () => {
    expect(normalizeEnterpriseApiUrl("https://github.example.com/api/v3/")).toBe(
      "https://github.example.com/api/v3"
    );
  });
});
