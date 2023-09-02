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
  min,
}: HeatmapBarRangeProps & {
  max: number;
  min: number;
}): HeatmapBarRange[] => {
  // TODO: get the actual min

  const ranges: HeatmapBarRange[] = [
    { start: Number.MIN_SAFE_INTEGER, end: min },
  ];

  const stepSize = max / steps;
  let lastRange = ranges[0];
  for (let index = 0; index < steps; index++) {
    const lastEnd = lastRange?.end ?? 0;

    const currentRange = { start: lastEnd, end: lastEnd + stepSize };
    ranges.push(currentRange);

    lastRange = currentRange;
  }

  return reverse ? ranges.reverse() : ranges;
};

export const useHeatmapBar = ({ max, min }: { max: number; min: number }) => {
  const getHeatmapBarRanges = useCallback(
    ({ steps = 4, reverse = false }: Partial<HeatmapBarRangeProps>) => {
      return pureGetHeatmapBarRanges({ max, reverse, steps, min });
    },
    [max, min]
  );

  return { getHeatmapBarRanges };
};

type HeatmapHookProps = {
  data: number[][];
  max?: number;
  startAtZero?: boolean;
  // TODO: add steps
};

export const getAllValuesFromData = ({
  data,
}: Pick<HeatmapHookProps, "data">) => {
  const raw = data.reduce((acc, curr) => acc.concat(curr), [] as number[]);
  return Array.from(new Set(raw));
};

const getMaxFromArray = (numbers: number[]) => {
  return numbers.reduce(
    (prev, curr) => (curr > prev ? curr : prev),
    Number.MIN_SAFE_INTEGER
  );
};

const getMinFromArray = (numbers: number[]) => {
  return numbers.reduce(
    (prev, curr) => (curr < prev ? curr : prev),
    Number.MAX_SAFE_INTEGER
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
export const useHeatmap = ({
  data,
  max: candidateMax,
  startAtZero = true,
}: HeatmapHookProps) => {
  const everyValue = useMemo(() => getAllValuesFromData({ data }), [data]);

  const max = useMemo(() => {
    if (candidateMax !== undefined) {
      return candidateMax;
    }

    return getMaxFromArray(everyValue);
  }, [everyValue, candidateMax]);

  const min = useMemo(() => {
    if (startAtZero) {
      return 0;
    }

    return getMinFromArray(everyValue);
  }, [everyValue, startAtZero]);

  const { getHeatmapBarRanges } = useHeatmapBar({ max, min });

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
