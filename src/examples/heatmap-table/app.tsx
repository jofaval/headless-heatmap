import React, { PropsWithChildren, useEffect, useId, useState } from "react";
import {
  HeatmapBarRange,
  getAllValuesFromData,
  useHeatmap,
} from "../../../packages/react/src/heatmap.hook";
import { Input, capitalize } from "./configuration-input.component";
import { useConfiguration, useDataGeneration } from "./data-generation.hook";

import "./app.css";

const classNames = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

type HeatmapBarCursorProps = {
  hoverPercentage: number | undefined;
};

function HeatmapBarCursor({ hoverPercentage }: HeatmapBarCursorProps) {
  if (hoverPercentage === undefined) {
    return null;
  }

  // const cursorHeight =
  //   document.getElementById("heatmap-bar-cursor")?.clientHeight;
  const cursorHeight = 5;

  const bottom = `max(calc(${hoverPercentage}%), ${cursorHeight ?? 0}px)`;

  return <div className="cursor" id="heatmap-bar-cursor" style={{ bottom }} />;
}

type HeatmapBarProps = {
  hoverPercentage: number | undefined;
  orientation?: string;
  getHeatmapBarRanges: (props: {
    reverse?: boolean;
    steps?: number;
  }) => HeatmapBarRange[];
  filterByRange: (props: { start: number; end: number }) => void;
  reverse?: boolean;
  steps?: number;
};

function HeatmapBar({
  hoverPercentage,
  orientation = "vertical",
  getHeatmapBarRanges,
  filterByRange,
  reverse,
  steps,
}: HeatmapBarProps) {
  const indicesId = useId();
  const indicesWidth = document.getElementById(indicesId)?.clientWidth;

  return (
    <div
      className="heatmap-bar"
      style={{
        right: -((indicesWidth ?? 0) + 20),
      }}>
      <div className={classNames("gradient", orientation)} />

      <div className="indices" id={indicesId}>
        {getHeatmapBarRanges({ reverse, steps }).map(({ end, start }) => (
          <button
            className="index"
            // TODO: add padding right so that it hovers over the gradient
            onClick={() => filterByRange({ end, start })}>
            {Math.round(end)}
          </button>
        ))}
      </div>

      <HeatmapBarCursor hoverPercentage={hoverPercentage} />
    </div>
  );
}

type HeatmapCellProps = {
  percentage: number;
  value: number;
  selected: boolean;
  tryingToSelect: boolean;
  setHoverPercentage: React.Dispatch<React.SetStateAction<number | undefined>>;
};

function HeatmapCell({
  percentage,
  selected,
  setHoverPercentage,
  value,
  tryingToSelect,
}: HeatmapCellProps) {
  const careAboutHover = !tryingToSelect || selected;

  return (
    <td
      className={classNames("heatmap-cell", selected ? "--selected" : "")}
      onMouseEnter={() => !careAboutHover || setHoverPercentage(percentage)}
      onMouseMove={() => !careAboutHover || setHoverPercentage(percentage)}
      onMouseLeave={() => setHoverPercentage(undefined)}>
      <div
        style={{ opacity: percentage / 100 }}
        className="heatmap-cell__background"
      />

      <div className={classNames("heatmap-cell__value")}>{value}</div>
    </td>
  );
}

function HeatmapRow({ children }: PropsWithChildren) {
  return <tr>{children}</tr>;
}

const SHOW_BAR = true;
const SHOW_CURRENT_PERCENTAGE = false;

const COLOR_SCHEME_OPTIONS = ["red", "blue", "green", "purple"];
type ColorScheme =
  (typeof COLOR_SCHEME_OPTIONS)[keyof typeof COLOR_SCHEME_OPTIONS];
const SELECTED_SCHEME: ColorScheme = "blue";

const THEME_OPTIONS = ["dark", "light"];
type Theme = (typeof THEME_OPTIONS)[keyof typeof THEME_OPTIONS];
const SELECTED_THEME: Theme = "dark";

function App() {
  const { cols, max, onChange, rows, chance } = useConfiguration();
  const { columnHeaders, data, rowHeaders } = useDataGeneration({
    cols,
    max,
    rows,
    chance,
  });

  const {
    getHeatmapRows,
    getHeatmapBarRanges,
    max: currentMax,
  } = useHeatmap({ data });
  const [hoverPercentage, setHoverPercentage] = useState<number>();

  const [filteredCells, setFilteredCells] = useState<number[]>([]);
  const [selectedRange, setSelectedRange] = useState<{
    start: number;
    end: number;
  }>();

  const cleanupFilter = () => {
    setFilteredCells([]);
    setSelectedRange(undefined);
  };
  useEffect(cleanupFilter, [data]);

  const filterByRange = ({ end, start }: { start: number; end: number }) => {
    const allValues = getAllValuesFromData({ data });
    const filteredValues = allValues.filter((n) => start <= n && n <= end);

    if (!filteredValues.length) {
      console.warn("resetting changes, no value was found with this filter", {
        start,
        end,
        filteredValues,
      });
      cleanupFilter();
      return;
    }

    const serializedPrevious = filteredCells.sort().toString();
    const serializedCurrent = filteredValues.sort().toString();
    const rangeHasChanged = serializedPrevious !== serializedCurrent;

    if (!rangeHasChanged) {
      cleanupFilter();
      return;
    }

    setFilteredCells(filteredValues);
    setSelectedRange({ end, start });
  };

  const [colorScheme, setColorScheme] = useState<string>(
    SELECTED_SCHEME as string
  );
  useEffect(() => {
    document.body.classList.add(colorScheme);
    return () => {
      document.body.classList.remove(colorScheme);
    };
  }, [colorScheme]);

  const [theme, setTheme] = useState<string>(SELECTED_THEME as string);
  useEffect(() => {
    document.body.classList.add(theme);
    return () => {
      document.body.classList.remove(theme);
    };
  }, [theme]);

  return (
    <div>
      <header>
        <div className="configuration-inputs">
          <Input onChange={onChange} name="rows" value={rows} />
          <Input onChange={onChange} name="cols" value={cols} />
          <Input onChange={onChange} name="max" value={max} />
          <Input onChange={onChange} name="chance" value={chance} />

          <div className="form-group">
            <label htmlFor="color-scheme">Color Scheme</label>

            <select
              id="color-scheme"
              value={colorScheme}
              onChange={(evt) => setColorScheme(evt.target.value)}>
              {COLOR_SCHEME_OPTIONS.map((value, index) => (
                <option value={value} key={index}>
                  {capitalize(value)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="color-scheme">Theme</label>

            <select
              id="theme"
              value={theme}
              onChange={(evt) => setTheme(evt.target.value)}>
              {THEME_OPTIONS.map((value, index) => (
                <option value={value} key={index}>
                  {capitalize(value)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="current-max">
          <div>Max: {currentMax}</div>

          {SHOW_CURRENT_PERCENTAGE && hoverPercentage !== undefined ? (
            <div>Current percentage: {hoverPercentage?.toFixed(2)}%</div>
          ) : null}

          {selectedRange ? (
            <div>
              Selected range: {Math.round(selectedRange.start)} -{" "}
              {Math.round(selectedRange.end)}
            </div>
          ) : null}
        </div>
      </header>

      <main className="heatmap">
        <table
          className={classNames(
            "heatmap__table",
            filteredCells.length ? "--with-selection" : ""
          )}>
          <thead>
            <tr>
              {columnHeaders.map((caption) => (
                <th>{caption}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {getHeatmapRows().map((row, rowIndex) => (
              <HeatmapRow key={rowIndex}>
                <td className="row-header">{rowHeaders[rowIndex]}</td>

                {row.map(({ percentage, value }, colIndex) => (
                  <HeatmapCell
                    key={colIndex}
                    percentage={percentage}
                    value={value}
                    selected={filteredCells.includes(value)}
                    tryingToSelect={!!filteredCells.length}
                    setHoverPercentage={setHoverPercentage}
                  />
                ))}
              </HeatmapRow>
            ))}
          </tbody>
        </table>

        {SHOW_BAR ? (
          <HeatmapBar
            filterByRange={filterByRange}
            getHeatmapBarRanges={getHeatmapBarRanges}
            hoverPercentage={hoverPercentage}
            orientation="vertical"
          />
        ) : null}
      </main>
    </div>
  );
}

export default App;
