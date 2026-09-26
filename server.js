const express = require("express");

const app = express();
const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Zavelo AI este online!");
});

app.listen(port, () => {
  console.log(`Zavelo AI rulează pe portul ${port}`);
});
