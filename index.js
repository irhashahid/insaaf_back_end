require("dotenv").config(); // for if frgot password and email verification

const express = require("express");
const cors = require("cors");
const path = require("path");
const { initDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const lawyerRoutes = require("./routes/lawyerRoutes");
const caseRoutes = require("./routes/caseRoutes");
const appointRoutes = require("./routes/appointRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");       // add
const ratingRoutes = require("./routes/ratingRoutes");  
const notificationRoutes = require("./routes/notificationRoutes"); // add

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", authRoutes);
app.use("/notifications", notificationRoutes);
app.use("/lawyers", lawyerRoutes);
app.use("/cases", caseRoutes);
app.use("/appointments", appointRoutes);
app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);
app.use("/ratings", ratingRoutes); 

initDB().then(() => {
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});