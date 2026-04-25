const express = require("express");
const cors = require("cors");
const { initDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const lawyerRoutes = require("./routes/lawyerRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", authRoutes);
app.use("/lawyers", lawyerRoutes);

initDB().then(() => {
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});