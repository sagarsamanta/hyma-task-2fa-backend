const express = require("express");
const app = express();
const cors = require("cors");

const mongoose = require("mongoose");
require("dotenv").config();
app.use(express.static(__dirname + "/public"));
app.use(express.json({ extended: false }));
app.use(cors());

// databse url
const DV = process.env.MONGO_URL;
// used port
const port = process.env.PORT;

// database connection
mongoose
  .connect(DV, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Database Connected..");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api/user", require("./routes/users"));

// listen server response
app.listen(port, () => {
  console.log(`SERVER WORKING ON ${port}`);
});
