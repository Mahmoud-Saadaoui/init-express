import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import "dotenv/config";
import authRouter from "./routes/auth.router.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Routes
app.get("/", (req, res) => {
    res.json({ message: "Hello World!" });
});
app.use("/api", authRouter);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});