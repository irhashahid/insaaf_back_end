const express = require("express");
const cors = require("cors");
const { initDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const lawyerRoutes = require("./routes/lawyerRoutes");
const caseRoutes = require("./routes/caseRoutes");
const appointRoutes = require("./routes/appointRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes      = require("./routes/messageRoutes");       // add


const app = express();
app.use(cors());
app.use(express.json());

app.use("/", authRoutes);
app.use("/lawyers", lawyerRoutes);
app.use("/cases", caseRoutes);
app.use("/appointments", appointRoutes);
app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);

initDB().then(() => {
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});