import React, { useState } from "react";
import {
  getAllValuesFromData,
  useHeatmap,
} from "../../packages/react/src/heatmap.hook";

const classNames = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

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
      <table>
        <thead>
          {headers.map((caption) => (
            <th>{caption}</th>
          ))}
        </thead>

        <tbody>
          {getHeatmapRows().map((row) => (
            <tr>
              {row.map(({ percentage, value }) => (
                <td
                  className="heatmap-cell"
                  onMouseEnter={() => setHoverPercentage(percentage)}
                  onMouseLeave={() => setHoverPercentage(undefined)}>
                  <div
                    style={{ opacity: percentage }}
                    className="heatmap-cell__background"
                  />
                  <div
                    className={filteredCells.includes(value) ? "selected" : ""}>
                    {value}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {hoverPercentage !== undefined ? (
          <div className="cursor" style={{ top: hoverPercentage }}></div>
        ) : null}

        <div className={classNames("gradient", orientation)} />

        <div className="indices">
          {getHeatmapBarRanges({ reverse: true, steps: 4 }).map(
            ({ end, start }) => (
              <div
                className="index"
                // TODO: add padding right so that it hovers over the gradient
                onClick={() => filterByRange({ end, start })}>
                {end}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
