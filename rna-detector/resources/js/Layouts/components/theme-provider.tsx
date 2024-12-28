import { useLocalStorage, useMediaQuery } from "@uidotdev/usehooks";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = PropsWithChildren<{
  defaultTheme?: Theme;
  storageKey?: string;
}>;

type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: Exclude<Theme, "system">;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useLocalStorage(storageKey, defaultTheme);
  const isSystemDark = useMediaQuery("(prefers-color-scheme: dark)");
  const resolvedTheme = useMemo(
    () => (theme === "system" ? (isSystemDark ? "dark" : "light") : theme),
    [theme, isSystemDark],
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme, theme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
