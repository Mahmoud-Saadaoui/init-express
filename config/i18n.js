import i18next from "i18next";
import { handle } from "i18next-http-middleware";
import en from "../locales/en.json" with { type: "json" };
import ar from "../locales/ar.json" with { type: "json" };

export const supportedLanguages = ["en", "ar"];
export const defaultLanguage = "en";

// Les messages sont regroupés par clé : req.t("auth.login.success")
const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

i18next.init({
  resources,
  supportedLngs: supportedLanguages,
  fallbackLng: defaultLanguage,
  // On accepte "ar" ou "ar-SA", mais pas "fr" ni "ar-EG".
  load: "currentOnly",
});

/**
 * Middleware Express :
 * - détecte la langue de la requête (?lang=ar ou en-tête Accept-Language)
 * - ajoute req.t() pour traduire et req.language pour la langue utilisée
 */
export const i18nMiddleware = handle(i18next, {
  defaultLanguage,
  // On renvoie la langue utilisée dans l'en-tête Content-Language
  setHeader: (req, res, language) => {
    res.setHeader("Content-Language", language);
  },
});

export default i18next;