import { useEffect, useState } from "react";

import { capitalize } from "./configuration-input.component";

function PreferencesSelector({
  initial,
  name,
  options,
}: {
  initial: string;
  name: string;
  options: string[];
}) {
  const [preference, setPreference] = useState<string>(initial);

  useEffect(() => {
    document.body.classList.add(preference);
    return () => document.body.classList.remove(preference);
  }, [preference]);

  return (
    <div className="form-group">
      <label htmlFor={name}>{name.split("-").map(capitalize).join(" ")}</label>

      <select
        id={name}
        value={preference}
        onChange={(evt) => setPreference(evt.target.value)}>
        {options.map((value, index) => (
          <option value={value} key={index}>
            {capitalize(value)}
          </option>
        ))}
      </select>
    </div>
  );
}

const COLOR_SCHEME_OPTIONS = ["red", "orange", "blue", "green", "purple"];
type ColorScheme =
  (typeof COLOR_SCHEME_OPTIONS)[keyof typeof COLOR_SCHEME_OPTIONS];
const SELECTED_SCHEME: ColorScheme = "blue";

export function ColorSchemeSelector() {
  return (
    <PreferencesSelector
      initial={SELECTED_SCHEME as string}
      name="color-scheme"
      options={COLOR_SCHEME_OPTIONS}
    />
  );
}

const THEME_OPTIONS = ["dark", "light"];
type Theme = (typeof THEME_OPTIONS)[keyof typeof THEME_OPTIONS];
const SELECTED_THEME: Theme = "dark";

export function ThemeSelector() {
  return (
    <PreferencesSelector
      initial={SELECTED_THEME as string}
      name="theme"
      options={THEME_OPTIONS}
    />
  );
}
