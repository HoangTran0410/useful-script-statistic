"use strict";
const fs = require("fs");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

let dbFile = "db.json";
let counter = JSON.parse(fs.readFileSync(dbFile) || "{}");
let saved = { ...counter };

function saveDb() {
  fs.writeFileSync(dbFile, JSON.stringify(counter));
  saved = { ...counter };
  console.log("Saved " + JSON.stringify(counter));
}

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/", async (req, res) => {
  res.send(
    `Server đếm số lượt sử dụng các chức năng của extension <a href="https://github.com/HoangTran0410/useful-script" target="blank">useful-script</a><br/>` +
      `Phục vụ cho quá trình <b>thống kê</b> xem chức năng nào được <b>dùng nhiều</b><br/>` +
      `Từ đó sẽ tập trung <b>cập nhật/nâng cấp</b> các chức năng đó<br/>` +
      `Extension mình đã dành rất nhiều thời gian để làm và chia sẻ <b>miễn phí</b> cho cộng đồng sử dụng<br/>` +
      `Nên mong các anh/chị nhân tài đừng hack hay spam server này tội em lắm ạ :( <br/></br>` +
      `Realtime data:<br/><pre>` +
      JSON.stringify(counter, null, 4) +
      "</pre><br/><br/>Saved data: (saved after each 60s)<br/><pre>" +
      JSON.stringify(saved, null, 4) +
      "</pre>"
  );
});

app.post("/count", (req, res) => {
  console.log("Recevied: " + JSON.stringify(req.body));
  if (req.body?.script) {
    let script = req.body.script;
    let newVal = (counter[script] || 0) + 1;
    counter[script] = newVal;
    console.log("Increased " + script + ": " + newVal);
    saveDb();
    res.send(script + ":" + newVal);
  } else {
    res.send("Not valid body");
  }
});

app.post("/clear", (req, res) => {
  console.log("Recevied: " + JSON.stringify(req.body));
  counter = {};
  saveDb();
  res.send("Cleared");
});

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
  body: JSON.stringify({ script: "abc" }),
});
*/
