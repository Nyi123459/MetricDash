import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const port = process.env.PORT || 8000;

app.use(express.json());

app.listen(port, () => {
  console.log(`Backend is running in port: ${port}`);
});
