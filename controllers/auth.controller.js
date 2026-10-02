import prisma from "../config/db.js";
import { AppError } from "../errors/app-error.js";

// Express 5 transmet automatiquement les erreurs des controllers async
// vers le middleware d'erreurs : pas besoin de try/catch ici.
export const register = async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: "Mahmoud",
        email: "mahmoud@example.com",
      },
    });

    res.status(201).json({
      message: req.t("auth.register.success"),
      user,
    });
  } catch (error) {
    // Erreur Prisma n°2002 = email déjà utilisé
    if (error.code === "P2002") {
      throw new AppError(409, "auth.register.emailAlreadyUsed");
    }

    throw new AppError(500, "auth.register.failed");
  }
};

export const login = (req, res) => {
  res.json({ message: req.t("auth.login.success") });
};