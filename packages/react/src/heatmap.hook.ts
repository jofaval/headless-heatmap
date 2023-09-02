import { useCallback, useMemo } from "react";

export type HeatmapBarRange = {
  start: number;
  end: number;
};

export const useHeatmapBar = ({ max }: { max: number }) => {
  const getHeatmapBarRanges = ({
    steps = 4,
    reverse = false,
  }: { reverse?: boolean; steps?: number } = {}): HeatmapBarRange[] => {
    const ranges = [];
    return ranges;
  };

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
  return data.reduce((acc, curr) => {
    acc.concat(curr);
    return acc;
  }, [] as number[]);
};

const getMaxFromArray = (numbers: number[]) => {
  return numbers.reduce((prev, curr) => (prev > curr ? curr : prev), -Infinity);
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
    value = props.data[props.x][props.y];
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
  }, [data]);

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
  }, [data]);

  return {
    max,
    getRelativePercentageFromValue,
    getHeatmapRows,
    getHeatmapBarRanges,
  };
};
