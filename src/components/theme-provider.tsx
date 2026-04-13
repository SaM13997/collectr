import * as React from "react";

export type ThemeSetting = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const THEME_STORAGE_KEY = "collectr-theme";
const DARK_THEME_MEDIA = "(prefers-color-scheme: dark)";
const LIGHT_THEME_COLOR = "#f7f2e8";
const DARK_THEME_COLOR = "#1f2431";

type ThemeContextValue = {
  theme: ThemeSetting;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeSetting) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function getStoredTheme(): ThemeSetting {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (
      storedTheme === "light" ||
      storedTheme === "dark" ||
      storedTheme === "system"
    ) {
      return storedTheme;
    }
  } catch {
    // Ignore storage access errors and fall back to system.
  }

  return "system";
}

function getSystemDarkMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(DARK_THEME_MEDIA).matches;
}

function resolveTheme(
  theme: ThemeSetting,
  systemDarkMode: boolean
): ResolvedTheme {
  return theme === "system" ? (systemDarkMode ? "dark" : "light") : theme;
}

function applyTheme(theme: ThemeSetting, systemDarkMode: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  const resolvedTheme = resolveTheme(theme, systemDarkMode);
  const root = document.documentElement;
  root.classList.toggle("dark", resolvedTheme === "dark");
  root.dataset.theme = resolvedTheme;

  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      "content",
      resolvedTheme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR
    );
}

export const themeScript = `
(() => {
  const storageKey = "${THEME_STORAGE_KEY}";
  const lightThemeColor = "${LIGHT_THEME_COLOR}";
  const darkThemeColor = "${DARK_THEME_COLOR}";
  const root = document.documentElement;

  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    const theme =
      storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
        ? storedTheme
        : "system";
    const systemDarkMode = window.matchMedia("${DARK_THEME_MEDIA}").matches;
    const resolvedTheme =
      theme === "system" ? (systemDarkMode ? "dark" : "light") : theme;

    root.classList.toggle("dark", resolvedTheme === "dark");
    root.dataset.theme = resolvedTheme;

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", resolvedTheme === "dark" ? darkThemeColor : lightThemeColor);
  } catch {
    root.dataset.theme = root.classList.contains("dark") ? "dark" : "light";
  }
})();
`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<ThemeSetting>(getStoredTheme);
  const [systemDarkMode, setSystemDarkMode] = React.useState(getSystemDarkMode);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_THEME_MEDIA);

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemDarkMode(event.matches);
    };

    setSystemDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage access errors and still apply the theme in-memory.
    }

    applyTheme(theme, systemDarkMode);
  }, [theme, systemDarkMode]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme: resolveTheme(theme, systemDarkMode),
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const theme = React.useContext(ThemeContext);

  if (!theme) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return theme;
}
