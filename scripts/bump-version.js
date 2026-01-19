const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const versionType = process.argv[2]; // patch, minor, major
const VALID_TYPES = ["patch", "minor", "major"];

if (!VALID_TYPES.includes(versionType)) {
  console.error(`Please provide a valid version type: ${VALID_TYPES.join(", ")}`);
  process.exit(1);
}

const packageJsonPath = path.resolve(__dirname, "../package.json");
const appJsonPath = path.resolve(__dirname, "../app.json");

// Read files
const packageJson = require(packageJsonPath);
const appJson = require(appJsonPath);

// Helper to increment version
function incrementVersion(version, type) {
  const parts = version.split(".").map(Number);
  if (type === "major") {
    parts[0]++;
    parts[1] = 0;
    parts[2] = 0;
  } else if (type === "minor") {
    parts[1]++;
    parts[2] = 0;
  } else {
    parts[2]++;
  }
  return parts.join(".");
}

const currentVersion = packageJson.version;
const newVersion = incrementVersion(currentVersion, versionType);

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");

// Update app.json
appJson.expo.version = newVersion;
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + "\n");

console.log(`Version updated from ${currentVersion} to ${newVersion}`);

// Optional: Git commit and tag
try {
  // Check if git is initialized
  execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });

  console.log("Creating git commit and tag...");
  execSync(`git add package.json app.json`);
  execSync(`git commit -m "chore(release): bump version to ${newVersion}"`);
  execSync(`git tag v${newVersion}`);
  console.log(`Git tag v${newVersion} created.`);
} catch (error) {
  console.log("Skipping git steps (git not initialized or error).");
}
