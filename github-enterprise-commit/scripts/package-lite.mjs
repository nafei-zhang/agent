import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.resolve(__dirname, "..");
const skillsRoot = path.resolve(projectDir, "../../..");
const targetDir = path.join(skillsRoot, "github-enterprise-commit-lite");

async function copyIfExists(source, target) {
  await fs.cp(source, target, { recursive: true });
}

async function writeMinimalPackageJson() {
  const minimalPackage = {
    name: "github-enterprise-commit-skill-lite",
    version: "1.0.0",
    private: true,
    type: "module",
    description: "Prebuilt release for enterprise commit skill (no npm install required)"
  };
  await fs.writeFile(path.join(targetDir, "package.json"), `${JSON.stringify(minimalPackage, null, 2)}\n`, "utf8");
}

async function main() {
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(path.join(targetDir, "docs"), { recursive: true });

  await copyIfExists(path.join(projectDir, "dist"), path.join(targetDir, "dist"));
  await fs.rm(path.join(targetDir, "dist", "tests"), { recursive: true, force: true });

  await copyIfExists(path.join(projectDir, "bin"), path.join(targetDir, "bin"));
  await copyIfExists(path.join(projectDir, "SKILL.md"), path.join(targetDir, "SKILL.md"));
  await copyIfExists(path.join(projectDir, "README.md"), path.join(targetDir, "README.md"));
  await copyIfExists(path.join(projectDir, "docs", "DEPLOYMENT.md"), path.join(targetDir, "docs", "DEPLOYMENT.md"));
  await writeMinimalPackageJson();

  console.log(`Lite 发布目录已生成: ${targetDir}`);
}

main().catch((error) => {
  console.error("生成 lite 发布目录失败:", error);
  process.exitCode = 1;
});
