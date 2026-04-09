require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  STATIC IMAGE FOLDER
app.use("/uploads", express.static("uploads"));

// ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/resume", require("./routes/resume"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/user", require("./routes/user"));
app.use("/api/ai", require("./routes/ai"));
// DB CONNECT
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected "))
  .catch(err => console.log(err));

// SERVER
app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT} `);
});