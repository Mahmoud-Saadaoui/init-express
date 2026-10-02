const errorHandler = (error, req, res, next) => {
  // Si la réponse a déjà commencé, on laisse Express gérer la fermeture
  if (res.headersSent) {
    return next(error);
  }

  // Nos AppError portent la clé de traduction, les autres erreurs non.
  const statusCode = error.statusCode ?? 500;
  const messageKey = error.messageKey ?? "errors.internalServerError";
  const message = req.t(messageKey);

  // On ne montre la pile d'appels qu'en développement
  const stack =
    process.env.NODE_ENV === "development" && statusCode === 500
      ? error.stack
      : null;

  res.status(statusCode).json({
    message,
    language: req.language,
    stack,
  });
};

export default errorHandler;