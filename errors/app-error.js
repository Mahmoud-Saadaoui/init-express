/**
 * Erreur "maison" de l'API : elle stocke une clé de traduction
 * (ex: "auth.register.failed") au lieu d'un message déjà écrit en dur.
 */
export class AppError extends Error {
  constructor(statusCode, messageKey) {
    super(messageKey);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.messageKey = messageKey;
  }
}