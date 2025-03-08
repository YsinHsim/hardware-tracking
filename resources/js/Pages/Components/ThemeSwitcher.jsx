import { useContext } from "react";
import { ThemeContext } from "../../Context/ThemeContext";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  // Available themes
  const themes = ["light", "dark", "winter", "business", "coffee", "acid", "synthwave"];

  return (
    <div className="flex gap-2 items-center">
      <select
        className="select select-bordered select-sm"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        {themes.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;
