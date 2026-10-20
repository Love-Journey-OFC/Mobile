// Roda o Gradle do projeto Android no Windows (gradlew.bat) ou no macOS/Linux (./gradlew).
// Uso: node scripts/gradle.mjs assembleDebug
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const android = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "android");
const args = process.argv.slice(2);
const result =
  process.platform === "win32"
    ? spawnSync("cmd.exe", ["/d", "/c", ".\\gradlew.bat", ...args], { cwd: android, stdio: "inherit" })
    : spawnSync("./gradlew", args, { cwd: android, stdio: "inherit" });
process.exitCode = result.status ?? 1;
