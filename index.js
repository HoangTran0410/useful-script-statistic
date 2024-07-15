"use strict";
const fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

const dbFile = "db.json";

let counter = (() => {
  try {
    return JSON.parse(fs.readFileSync(dbFile) || "{}");
  } catch (e) {
    console.log("ERROR", e);
  }
  return {};
})();
let counterSaved = false;
let logTemp = "";

function getLogFilePath(date) {
  const logDir = path.join(__dirname, "my-logs");
  const fileName = date.toISOString().slice(0, 10) + ".txt";
  let filePath = path.join(logDir, fileName);
  return filePath;
}

function addLog(text) {
  logTemp += text + "\n";
}

function saveLog(tried = 5) {
  if (!logTemp) return;
  let filePath = getLogFilePath(new Date(now()));
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
  }
  fs.appendFile(filePath, logTemp, (err) => {
    if (err) {
      console.log("ERROR save log: ", err);
      if (tried > 0) {
        console.log("Retrying... " + tried);
        saveLog(--tried);
      }
    } else {
      console.log(logTemp);
      logTemp = "";
    }
  });
}

function getLog(date) {
  let filePath = getLogFilePath(date);
  if (!fs.existsSync(filePath)) {
    return "Log not found";
  }
  return fs
    .readFileSync(filePath, "utf8")
    .toString()
    .split("\n")
    .reverse()
    .join("<br/>");
}

function saveCounter(tried = 5) {
  if (counterSaved) return;
  let text;
  try {
    text = JSON.stringify(counter, null, 4);
    let json = JSON.parse(text); // try to parse again
  } catch (error) {
    setTimeout(() => {
      saveCounter(tried);
    }, 2000);
    return;
  }
  fs.writeFile(dbFile, text, (err) => {
    if (err) {
      console.log("ERROR save counter ", err);
      if (tried > 0) {
        console.log("Retrying... " + tried);
        saveCounter(--tried);
      }
    } else {
      counterSaved = true;
    }
  });
}

function sortObjectByValue(obj) {
  const sortable = Object.entries(obj);
  sortable.sort((a, b) => b[1] - a[1]);
  return Object.fromEntries(sortable);
}

function sortObjectByKey(obj) {
  const sortable = Object.entries(obj);
  sortable.sort((a, b) => b[0].localeCompare(a[0]));
  return Object.fromEntries(sortable);
}

function sort(data) {
  const sortedData = {};
  for (const key in data) {
    sortedData[key] = sortObjectByValue(data[key]);
  }
  return sortObjectByKey(sortedData);
}

const now = () =>
  new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/", async (req, res) => {
  res.send(
    `Server đếm số lượt sử dụng các chức năng của extension <a href="https://github.com/HoangTran0410/useful-script" target="blank">useful-script</a><br/>` +
      `Phục vụ cho quá trình <b>thống kê</b> xem chức năng nào được <b>dùng nhiều</b><br/>` +
      `Từ đó sẽ tập trung <b>cập nhật/nâng cấp</b> các chức năng đó<br/>` +
      `Extension mình đã dành rất nhiều thời gian để làm và chia sẻ <b>miễn phí</b> cho cộng đồng sử dụng<br/>` +
      `Nên mong các anh/chị nhân tài đừng hack hay spam server này tội em lắm ạ :(`
  );
});

app.get("/json", async (req, res) => {
  res.send(sort(counter));
});

app.get("/log", async (req, res) => {
  res.send(getLog(new Date(now())));
});

app.get("/log/:date", async (req, res) => {
  try {
    const dateStr = req.params.date;
    const [year, month, day] = dateStr.split("-");
    const date = new Date(year, month - 1, day);
    res.send(getLog(date));
  } catch (error) {
    res.send("ERROR: " + error.message);
  }
});

app.post("/count", (req, res) => {
  console.log("Recevied: " + JSON.stringify(req.body));
  const { script, version = "old", uid = "" } = req.body || {};
  if (script) {
    if (!counter[version]) {
      counter[version] = {};
    }
    if (!counter[version][script]) {
      counter[version][script] = 0;
    }
    let newVal = counter[version][script] + 1;
    counter[version][script] = newVal;
    counterSaved = false;
    let log = `${now()}: ${script} (${version}-${uid}) -> ${newVal}`;
    addLog(log);
    res.send(log);
  } else {
    res.send("Not valid body");
  }
});

app.listen(port, () => {
  console.log(`Useful script statistic app listening on port ${port}`);
  setInterval(() => {
    saveCounter();
    saveLog();
  }, 1000 * 15);
});

/* Update data:
fetch("http://localhost:3000/count", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ script: "abc", version: "xyz" }),
});
*/
