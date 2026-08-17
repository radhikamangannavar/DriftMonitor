require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/database");
require("./models");
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();