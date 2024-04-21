"use strict";
const fs = require("fs");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

const dbFile = "db.json";
const logFile = "log.txt";

let counter = JSON.parse(fs.readFileSync(dbFile) || "{}");

function writeLog(text) {
  fs.appendFileSync(logFile, text + "\n");
  console.log(text);
}

function saveDb() {
  fs.writeFileSync(dbFile, JSON.stringify(counter));
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
  res.send(
    fs.readFileSync(logFile).toString().split("\n").reverse().join("<br/>")
  );
});

app.get("/clear-log", async (req, res) => {
  fs.writeFileSync(logFile, "");
  res.send("Cleared");
});

app.post("/count", (req, res) => {
  console.log("Recevied: " + JSON.stringify(req.body));
  const { script, version = "old" } = req.body || {};
  if (script) {
    if (!counter[version]) {
      counter[version] = {};
    }
    if (!counter[version][script]) {
      counter[version][script] = 0;
    }
    let newVal = counter[version][script] + 1;
    counter[version][script] = newVal;
    let log = `${now()}: ${script} (${version}) -> ${newVal}`;
    writeLog(log);
    res.send(log);
    saveDb();
  } else {
    res.send("Not valid body");
  }
});

// app.post("/clear", (req, res) => {
//   console.log("Recevied: " + JSON.stringify(req.body));
//   counter = {};
//   saveDb();
//   res.send("Cleared");
// });

app.listen(port, () => {
  console.log(`Useful script statistic app listening on port ${port}`);
  // setInterval(saveDb, 1000 * 60);
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
