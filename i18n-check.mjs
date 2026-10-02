import express from "express";
import { i18nMiddleware } from "./config/i18n.js";
import errorHandler from "./middlewares/error.middleware.js";
import { AppError } from "./errors/app-error.js";

const app = express();
app.use(i18nMiddleware);

app.get("/", (req, res) => res.json({ message: req.t("common.helloWorld"), language: req.language }));
app.get("/login", (req, res) => res.json({ message: req.t("auth.login.success") }));
app.get("/boom", () => {
  throw new AppError(409, "auth.register.emailAlreadyUsed");
});
app.get("/crash", () => {
  throw new Error("raw prisma failure that must stay hidden");
});
app.use(errorHandler);

const server = app.listen(3999);
const base = "http://localhost:3999";

const check = async (path, headers = {}) => {
  const res = await fetch(base + path, { headers });
  console.log(path, JSON.stringify(headers), "->", res.headers.get("content-language"), await res.text());
};

await check("/");
await check("/login", { "accept-language": "ar" });
await check("/login", { "accept-language": "ar-SA,ar;q=0.9" });
await check("/login?lang=ar");
await check("/login", { "accept-language": "fr-FR,fr;q=0.9" });
await check("/boom", { "accept-language": "ar" });
await check("/crash");
server.close();