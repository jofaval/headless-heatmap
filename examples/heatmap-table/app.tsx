import React, { PropsWithChildren, useState } from "react";
import {
  HeatmapBarRange,
  getAllValuesFromData,
  useHeatmap,
} from "../../packages/react/src/heatmap.hook";

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

function HeatmapCell({
  percentage,
  value,
  selected,
  setHoverPercentage,
}: {
  percentage: number;
  value: number;
  selected: boolean;
  setHoverPercentage: React.Dispatch<React.SetStateAction<number | undefined>>;
}) {
  return (
    <td
      className="heatmap-cell"
      onMouseEnter={() => setHoverPercentage(percentage)}
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

function App() {
  const data = [];
  const headers = ["Column", "Column", "Column", "Column", "Column"];

  const { getHeatmapRows, getHeatmapBarRanges } = useHeatmap({ data });
  const [hoverPercentage, setHoverPercentage] = useState<number>();

  const [filteredCells, setFilteredCells] = useState<number[]>([]);

  const filterByRange = ({ end, start }: { start: number; end: number }) => {
    const allValues = getAllValuesFromData({ data });
    const filteredValues = allValues.filter((n) => n >= start && n <= end);
    setFilteredCells(filteredValues);
  };

  const orientation = "vertical";

  return (
    <div>
      <table className={filteredCells.length ? "--with-selection" : ""}>
        <thead>
          {headers.map((caption) => (
            <th>{caption}</th>
          ))}
        </thead>

        <tbody>
          {getHeatmapRows().map((row) => (
            <HeatmapRow>
              <td className="row-header">Row</td>

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
        orientation={orientation}
      />
    </div>
  );
}

export default App;
