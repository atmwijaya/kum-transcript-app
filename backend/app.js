import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {errorHandler} from "./middleware/errorHandler.js";
import connectDB from "./config/db.js";
import databaseRouter from "./routes/database.route.js";
import nilaiKumulatifRoutes from "./routes/kumulatif.route.js";

dotenv.config();

const app = express();

await connectDB();

app.use(cors({

}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/db', databaseRouter);
app.use('/api/nilai-kumulatif', nilaiKumulatifRoutes);

app.use(errorHandler);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

export default app;