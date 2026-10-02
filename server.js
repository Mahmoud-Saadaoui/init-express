import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import "dotenv/config";
import authRouter from "./routes/auth.router.js";
import errorHandler from "./middlewares/error.middleware.js";
import { i18nMiddleware } from "./config/i18n.js";

const app = express();

// Middleware
app.use(express.json());
// L'i18n doit venir tôt : tous les middlewares/routes suivants utilisent req.t()
app.use(i18nMiddleware);
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    // Message traduit dans la langue de la requête
    handler: (req, res) => {
      res.status(429).json({ message: req.t("errors.rateLimitExceeded") });
    },
});
app.use(limiter);

// Routes
app.get("/", (req, res) => {
    res.json({ message: req.t("common.helloWorld") });
});
app.use("/api", authRouter);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});