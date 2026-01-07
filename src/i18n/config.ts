export const locales = ["en", "uz", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  uz: "O'zbekcha",
  ru: "Русский",
};

export const localeFlags: Record<Locale, string> = {
  en: "GB",
  uz: "UZ",
  ru: "RU",
};
