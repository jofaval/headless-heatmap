import React, { PropsWithChildren, useState } from "react";
import {
  HeatmapBarRange,
  getAllValuesFromData,
  useHeatmap,
} from "../../packages/react/src/heatmap.hook";
import { useConfiguration, useDataGeneration } from "./data-generation.hook";

const classNames = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

type HeatmapBarProps = {
  hoverPercentage: number | undefined;
  orientation?: string;
  getHeatmapBarRanges: (props?: {
    reverse?: boolean | undefined;
    steps?: number | undefined;
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
  reverse = true,
  steps = 4,
}: HeatmapBarProps) {
  return (
    <div>
      {hoverPercentage !== undefined ? (
        <div className="cursor" style={{ top: hoverPercentage }}></div>
      ) : null}

      <div className={classNames("gradient", orientation)} />

      <div className="indices">
        {getHeatmapBarRanges({ reverse, steps }).map(({ end, start }) => (
          <div
            className="index"
            // TODO: add padding right so that it hovers over the gradient
            onClick={() => filterByRange({ end, start })}>
            {end}
          </div>
        ))}
      </div>
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
  value,
  selected,
  setHoverPercentage,
}: HeatmapCellProps) {
  return (
    <td
      className="heatmap-cell"
      onMouseEnter={() => setHoverPercentage(percentage)}
      onMouseMove={() => setHoverPercentage(percentage)}
      onMouseLeave={() => setHoverPercentage(undefined)}>
      <div
        style={{ opacity: percentage }}
        className="heatmap-cell__background"
      />
      <div className={selected ? "selected" : ""}>{value}</div>
    </td>
  );
}

function HeatmapRow({ children }: PropsWithChildren) {
  return <tr>{children}</tr>;
}

const capitalize = <T extends string>(text: T): Capitalize<Lowercase<T>> => {
  const transformed =
    text.charAt(0).toLocaleUpperCase() + text.substring(1).toLocaleLowerCase();

  return transformed as Capitalize<Lowercase<T>>;
};

function Input({
  onChange,
  value,
  name,
}: {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  value: number;
  name: string;
}) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{`${capitalize(name)}:`}</label>

      <input
        name={name}
        id={name}
        type="number"
        onChange={onChange}
        value={value}
      />
    </div>
  );
}

function App() {
  const { cols, max, onChange, rows } = useConfiguration();
  const { columnHeaders, data, rowHeaders } = useDataGeneration({
    cols,
    max,
    rows,
  });

  const { getHeatmapRows, getHeatmapBarRanges } = useHeatmap({ data });
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
        <Input onChange={onChange} name="rows" value={rows} />
        <Input onChange={onChange} name="cols" value={cols} />
        <Input onChange={onChange} name="max" value={max} />
      </header>

      <main className="heatmap">
        <table className={filteredCells.length ? "--with-selection" : ""}>
          <thead>
            {columnHeaders.map((caption) => (
              <th>{caption}</th>
            ))}
          </thead>

          <tbody>
            {getHeatmapRows().map((row, rowIndex) => (
              <HeatmapRow>
                <td className="row-header">{rowHeaders[rowIndex]}</td>

                {row.map(({ percentage, value }) => (
                  <HeatmapCell
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

        <HeatmapBar
          filterByRange={filterByRange}
          getHeatmapBarRanges={getHeatmapBarRanges}
          hoverPercentage={hoverPercentage}
          orientation="vertical"
        />
      </main>
    </div>
  );
}

export default App;
