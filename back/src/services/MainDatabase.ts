import Database from "better-sqlite3";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const dbFilePath = path.resolve(process.env.DATABASES_PATH + "chats.db");

console.log("✅ Using SQLite database at:", dbFilePath);

// Direct SQLite connection
export const db = new Database(dbFilePath);
