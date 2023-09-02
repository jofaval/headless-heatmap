import { useCallback, useMemo } from "react";

export type HeatmapBarRange = {
  start: number;
  end: number;
};

type HeatmapBarRangeProps = { reverse: boolean; steps: number };

// TODO: refinement needed
const pureGetHeatmapBarRanges = ({
  steps,
  reverse,
  max,
}: HeatmapBarRangeProps & {
  max: number;
}): HeatmapBarRange[] => {
  // TODO: get the actual min
  const min = 0;

  const ranges: HeatmapBarRange[] = [
    { start: Number.MIN_SAFE_INTEGER, end: min },
  ];

  const stepSize = max / steps;
  for (let index = 1; index <= steps; index++) {
    // the +1 might lead up to errors
    ranges.push({
      start: index - 1,
      end: Math.round(index * stepSize) + 1,
    });
  }

  return reverse ? ranges.reverse() : ranges;
};

export const useHeatmapBar = ({ max }: { max: number }) => {
  const getHeatmapBarRanges = useCallback(
    ({ steps = 4, reverse = false }: Partial<HeatmapBarRangeProps>) => {
      return pureGetHeatmapBarRanges({ max, reverse, steps });
    },
    [max]
  );

  return { getHeatmapBarRanges };
};

type HeatmapHookProps = {
  data: number[][];
  max?: number;
  // TODO: add steps
};

export const getAllValuesFromData = ({
  data,
}: Pick<HeatmapHookProps, "data">) => {
  return data.reduce((acc, curr) => acc.concat(curr), [] as number[]);
};

const getMaxFromArray = (numbers: number[]) => {
  return numbers.reduce(
    (prev, curr) => (curr > prev ? curr : prev),
    Number.MIN_SAFE_INTEGER
  );
};

type GetRelativePercentageFromValueProps =
  | { x: number; y: number }
  | { value: number };

const pureGetRelativePercentageFromValue = (
  props: GetRelativePercentageFromValueProps & {
    max: number;
  } & Pick<HeatmapHookProps, "data">
) => {
  let value: number;
  if ("x" in props) {
    value = props.data[props.x]![props.y]!;
  } else {
    value = props.value;
  }

  return (value * 100) / props.max;
};

/**
 * Assumes positive numbers
 */
export const useHeatmap = ({ data, max: candidateMax }: HeatmapHookProps) => {
  const max = useMemo(() => {
    if (candidateMax !== undefined) {
      return candidateMax;
    }

    const values = getAllValuesFromData({ data });
    return getMaxFromArray(values);
  }, [data, candidateMax]);

  const { getHeatmapBarRanges } = useHeatmapBar({ max });

  const getRelativePercentageFromValue = useCallback(
    (props: GetRelativePercentageFromValueProps) => {
      return pureGetRelativePercentageFromValue(
        Object.assign({ data, max }, props)
      );
    },
    [data, max]
  );

  const getHeatmapRows = useCallback(() => {
    return data.map((row) => {
      return row.map((value) => ({
        value,
        percentage: getRelativePercentageFromValue({ value }),
      }));
    });
  }, [data, getRelativePercentageFromValue]);

  return {
    max,
    getRelativePercentageFromValue,
    getHeatmapRows,
    getHeatmapBarRanges,
  };
};
