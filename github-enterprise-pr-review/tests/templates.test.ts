import { describe, expect, it } from "vitest";
import { detectLanguageFromFile, getLanguageTemplates } from "../src/templates.js";

describe("templates", () => {
  it("should include required languages", () => {
    const templates = getLanguageTemplates().map((t) => t.language);
    expect(templates).toContain("TypeScript");
    expect(templates).toContain("JavaScript");
    expect(templates).toContain("Python");
    expect(templates).toContain("Java");
    expect(templates).toContain("Go");
    expect(templates).toContain("C++");
    expect(templates).toContain("Frontend Review");
    expect(templates).toContain("Backend Review");
    expect(templates).toContain("DevOps Review");
  });

  it("should include tabular review prompts for engineering templates", () => {
    const templates = getLanguageTemplates("zh");
    const frontend = templates.find((t) => t.language === "Frontend Review");
    const backend = templates.find((t) => t.language === "Backend Review");
    const devops = templates.find((t) => t.language === "DevOps Review");

    expect(frontend?.prompt).toContain("| 检查大项 | 细项 | 评审要点 | 通过标准 | 常见缺陷 | 改进建议 | 责任人 | 完成时限 |");
    expect(backend?.prompt).toContain("| 检查大项 | 细项 | 评审要点 | 通过标准 | 常见缺陷 | 改进建议 | 责任人 | 完成时限 |");
    expect(devops?.prompt).toContain("| 检查大项 | 细项 | 评审要点 | 通过标准 | 常见缺陷 | 改进建议 | 责任人 | 完成时限 |");

    expect(frontend?.prompt).toContain("Jira/Azure DevOps 一键导入建议（CSV UTF-8）");
    expect(backend?.prompt).toContain("Jira/Azure DevOps 一键导入建议（CSV UTF-8）");
    expect(devops?.prompt).toContain("Jira/Azure DevOps 一键导入建议（CSV UTF-8）");
  });

  it("should return english prompts when lang is en", () => {
    const templates = getLanguageTemplates("en");
    const frontend = templates.find((t) => t.language === "Frontend Review");
    const typescript = templates.find((t) => t.language === "TypeScript");

    expect(frontend?.prompt).toContain("| Category | Sub-item | Review Focus | Pass Criteria | Common Defects | Improvement Suggestions | Owner | Due Time |");
    expect(frontend?.prompt).toContain("Jira/Azure DevOps one-click import suggestion (CSV UTF-8)");
    expect(typescript?.prompt).toContain("Focus on complete typing");
    expect(typescript?.checklist[0]).toBe("Code quality and readability");
  });

  it("should detect language by file extension", () => {
    expect(detectLanguageFromFile("src/app.ts")).toBe("TypeScript");
    expect(detectLanguageFromFile("service.py")).toBe("Python");
    expect(detectLanguageFromFile("main.go")).toBe("Go");
  });
});
