import db from "./db.js";
import express from "express";
const app = express();
const port = 3000;

const counter = db.data.counter || {};

app.get("/", async (req, res) => {
  res.send(
    `Server đếm số lượt sử dụng các chức năng của extension <a href="https://github.com/HoangTran0410/useful-script" target="blank">useful-script</a><br/>` +
      `Phục vụ cho quá trình <b>thống kê</b> xem chức năng nào được <b>dùng nhiều</b><br/>` +
      `Từ đó sẽ tập trung <b>cập nhật/nâng cấp</b> các chức năng đó<br/>` +
      `Extension mình đã dành rất nhiều thời gian để làm và chia sẻ <b>miễn phí</b> cho cộng đồng sử dụng<br/>` +
      `Nên mong các anh/chị nhân tài đừng hack hay spam server này tội em lắm ạ :( <br/></br>` +
      `Realtime data:<br/>` +
      JSON.stringify(counter) +
      "<br/><br/>Saved data: (saved after each 60s)<br/>" +
      JSON.stringify(db.data.counter)
  );
});

app.post("/count", (req, res) => {
  res.send("Got a POST request");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);

  setInterval(async () => {
    db.data.counter = counter;
    await db.write();
    console.log("Written counter to db.");
  }, 1000 * 60);
});
