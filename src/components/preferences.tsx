"use client";

import { createContext, createElement, useContext, useEffect, useState, type ReactNode, type JSX } from "react";
import { spanish } from "@/i18n/es";

type Language = "en" | "es";
const Preferences = createContext({ language: "en" as Language, theme: "light", setLanguage: (_: Language) => {}, setTheme: (_: string) => {} });
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    try { setLanguage(localStorage.getItem("lab-language") === "es" ? "es" : "en"); setTheme(localStorage.getItem("lab-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")); } catch {}
  }, []);
  function changeLanguage(value: Language) { setLanguage(value); try { localStorage.setItem("lab-language", value); } catch {} }
  function changeTheme(value: string) { setTheme(value); try { localStorage.setItem("lab-theme", value); } catch {} }
  useEffect(() => { document.documentElement.lang = language; document.documentElement.dataset.theme = theme; }, [language, theme]);
  return <Preferences.Provider value={{ language, theme, setLanguage: changeLanguage, setTheme: changeTheme }}>{children}</Preferences.Provider>;
}
export function usePreferences() { return useContext(Preferences); }
export function translate(text: string, language: Language): string {
  if (language === "en") return text;
  const key = text.trim().replace(/\s+/g, " ");
  if (spanish[key]) return text.replace(text.trim(), spanish[key]);
  // Dynamic sentences retain their numeric values and units.
  for (const [source, target] of Object.entries(spanish)) {
    if (!source.includes("{n}")) continue;
    const escaped = source.split("{n}").map(part => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("(.+?)");
    const match = key.match(new RegExp(`^${escaped}$`));
    if (match) { let index = 1; return target.replace(/\{n\}/g, () => match[index++]); }
  }
  return text;
}
export function T({ children }: { children: ReactNode }) {
  const { language } = usePreferences();
  const convert = (value: ReactNode): ReactNode => typeof value === "string" ? translate(value, language) : Array.isArray(value) ? value.map(convert) : value;
  return convert(children);
}
export function L<K extends keyof JSX.IntrinsicElements>({ as, ...original }: { as: K } & JSX.IntrinsicElements[K]) {
  const props = { ...original } as Record<string, unknown>;
  const { language } = usePreferences();
  for (const key of ["aria-label", "title", "placeholder"]) if (typeof props[key] === "string") props[key] = translate(props[key] as string, language);
  return createElement(as, props);
}
export function PreferenceControls() {
  const { language, theme, setLanguage, setTheme } = usePreferences();
  return <div className="preference-controls">
    <button type="button" onClick={() => setLanguage(language === "en" ? "es" : "en")} aria-label={language === "en" ? "Cambiar a español" : "Switch to English"}>{language === "en" ? "ES" : "EN"}</button>
    <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={language === "es" ? (theme === "dark" ? "Activar modo claro" : "Activar modo oscuro") : (theme === "dark" ? "Use light mode" : "Use dark mode")} aria-pressed={theme === "dark"}>{theme === "dark" ? "☀" : "☾"}</button>
  </div>;
}
