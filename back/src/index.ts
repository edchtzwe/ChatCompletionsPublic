import "module-alias/register";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
const cors = require('cors');

import baseChatCompletionRouter from '@routes/chat-completion/index';
import { Settings } from "@services/Settings";
import { logger } from '@services/Logger';

const app = express();
app.use(cors()); // <--- Allow CORS for all origins (use carefully in production)
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Root route - returns a JSON response with status 200
app.get("/ping", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello World!",
    timestamp: new Date().toISOString(),
  });
});

app.use("/chat", baseChatCompletionRouter);

// 404 Handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
