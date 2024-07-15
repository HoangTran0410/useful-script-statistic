const fs = require("fs");
const path = require("path");

function extractEventName(log) {
  let logWithoutUid = log.replace(/-\d+/, "");
  let lastColon = logWithoutUid.lastIndexOf(":");
  let lastArrow = logWithoutUid.lastIndexOf("->");
  let scriptName = logWithoutUid.substring(lastColon + 1, lastArrow - 1).trim();
  return scriptName;
}

function extractVersion(log) {
  let lastBracket = log.lastIndexOf("(");
  let nextDash = log.indexOf("-", lastBracket);
  return log.substring(lastBracket + 1, nextDash).trim();
}

function extractCount(log) {
  let count = log?.split("->")?.[1];
  if (count) return parseInt(count);
  return 0;
}

function main() {
  const logDir = path.join(__dirname, "my-logs");
  const files = fs.readdirSync(logDir);
  const counter = {};
  const logs = [];
  files.forEach((file) => {
    const filePath = path.join(logDir, file);
    let lines = fs.readFileSync(filePath, "utf8").split("\n");
    logs.push(...lines);
  });

  logs.forEach((log) => {
    let version = extractVersion(log);
    let eventName = extractEventName(log);
    let count = extractCount(log);

    if (!counter[version]) {
      counter[version] = {};
    }
    if (!counter[version][eventName]) {
      counter[version][eventName] = 0;
    }
    let newVal = Math.max(counter[version][eventName], count);
    counter[version][eventName] = newVal;
  });

  fs.writeFileSync("db.json", JSON.stringify(counter, null, 4));
}

main();
