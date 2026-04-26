import os from "node:os";
import path from "node:path";

export function getConfigDir(): string {
  const customDir = process.env.GEC_CONFIG_DIR;
  if (customDir && customDir.trim()) {
    return customDir.trim();
  }
  if (process.platform === "win32") {
    const appData = process.env.APPDATA;
    if (appData) {
      return path.join(appData, "gec-skill");
    }
    return path.join(os.homedir(), ".gec-skill");
  }
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "gec-skill");
  }
  return path.join(process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), ".config"), "gec-skill");
}

export function getConfigFilePath(): string {
  return path.join(getConfigDir(), "config.json");
}

export function getKeyFilePath(): string {
  return path.join(getConfigDir(), "secret.key");
}
