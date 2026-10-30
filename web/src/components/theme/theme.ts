export const THEME_STORAGE_KEY = "rt-theme:v1";
export const THEME_ATTRIBUTE = "data-theme";
export const THEME_PREFERENCE_ATTRIBUTE = "data-theme-pref";

export type ThemePreference = "system" | "light" | "dark";

export function parseThemePreference(value: string | null | undefined): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}

// Script fixo e síncrono do head: só lê a escolha explícita e define atributos em <html> antes da primeira pintura. Sistema não define data-theme; o CSS segue prefers-color-scheme.
export const themeBootstrapScript = `(function(){var d=document.documentElement,p="system";try{var v=localStorage.getItem("${THEME_STORAGE_KEY}");if(v==="light"||v==="dark")p=v}catch(e){}d.setAttribute("${THEME_PREFERENCE_ATTRIBUTE}",p);if(p!=="system")d.setAttribute("${THEME_ATTRIBUTE}",p)})()`;
