import { useEffect, useState } from "react";

import { SESSION_KEYS } from "../constants/app.constants.js";

const getInitialTheme = () => {
  const storedTheme = window.localStorage.getItem(SESSION_KEYS.THEME);
  if (storedTheme) {
    return storedTheme;
  }

  return "dark";
};

export const useTheme = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(SESSION_KEYS.THEME, theme);
  }, [theme]);

  return {
    theme,
    toggleTheme: () => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))
  };
};
