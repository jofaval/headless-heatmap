import React, { PropsWithChildren, useState } from "react";
import {
  HeatmapBarRange,
  getAllValuesFromData,
  useHeatmap,
} from "../../../packages/react/src/heatmap.hook";
import { Input } from "./configuration-input.component";
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
  distanceFromTable?: number;
};

function HeatmapBar({
  hoverPercentage,
  orientation = "vertical",
  getHeatmapBarRanges,
  filterByRange,
  reverse = true,
  steps = 4,
  distanceFromTable = 35,
}: HeatmapBarProps) {
  return (
    <div className="heatmap-bar" style={{ right: -distanceFromTable }}>
      <div className="indices">
        {getHeatmapBarRanges({ reverse, steps }).map(({ end, start }) => (
          <div
            className="index"
            // TODO: add padding right so that it hovers over the gradient
            onClick={() => filterByRange({ end, start })}>
            {Math.round(end)}
          </div>
        ))}
      </div>
      <div className={classNames("gradient", orientation)} />

      <HeatmapBarCursor hoverPercentage={hoverPercentage} />
    </div>
  );
}

type HeatmapCellProps = {
  percentage: number;
  value: number;
  selected: boolean;
  setHoverPercentage: React.Dispatch<React.SetStateAction<number | undefined>>;
};

function HeatmapCell({
  percentage,
  selected,
  setHoverPercentage,
  value,
}: HeatmapCellProps) {
  return (
    <td
      className="heatmap-cell"
      onMouseEnter={() => setHoverPercentage(percentage)}
      onMouseMove={() => setHoverPercentage(percentage)}
      onMouseLeave={() => setHoverPercentage(undefined)}>
      <div
        style={{ opacity: percentage / 100 }}
        className="heatmap-cell__background"
      />

      <div
        className={classNames(
          "heatmap-cell__value",
          selected ? "selected" : ""
        )}>
        {value}
      </div>
    </td>
  );
}

function HeatmapRow({ children }: PropsWithChildren) {
  return <tr>{children}</tr>;
}

const SHOW_BAR = true;
const SHOW_CURRENT_PERCENTAGE = false;

function App() {
  const { cols, max, onChange, rows } = useConfiguration();
  const { columnHeaders, data, rowHeaders } = useDataGeneration({
    cols,
    max,
    rows,
  });

  const {
    getHeatmapRows,
    getHeatmapBarRanges,
    max: currentMax,
  } = useHeatmap({ data });
  const [hoverPercentage, setHoverPercentage] = useState<number>();

  const [filteredCells, setFilteredCells] = useState<number[]>([]);

  const filterByRange = ({ end, start }: { start: number; end: number }) => {
    const allValues = getAllValuesFromData({ data });
    const filteredValues = allValues.filter((n) => start <= n && n <= end);
    setFilteredCells(filteredValues);
  };

  return (
    <div>
      <header>
        <div className="configuration-inputs">
          <Input onChange={onChange} name="rows" value={rows} />
          <Input onChange={onChange} name="cols" value={cols} />
          <Input onChange={onChange} name="max" value={max} />
        </div>

        <div className="current-max">
          <div>Max: {currentMax}</div>

          {SHOW_CURRENT_PERCENTAGE && hoverPercentage !== undefined ? (
            <div>Current percentage: {hoverPercentage?.toFixed(2)}%</div>
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
            distanceFromTable={currentMax.toString().length * 12.5}
          />
        ) : null}
      </main>
    </div>
  );
}

export default App;
