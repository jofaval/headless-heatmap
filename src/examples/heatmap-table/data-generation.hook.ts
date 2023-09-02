import { Reducer, useMemo, useReducer } from "react";

const INITIAL_CONFIGURATION = {
  rows: 10,
  cols: 10,
  max: 2_000,
  chance: 4,
};
type Configuration = typeof INITIAL_CONFIGURATION;

type ConfigurationReducer = Reducer<
  Configuration,
  { name: string; value: number }
>;

export const useConfiguration = () => {
  const [{ cols, max, rows, chance }, updateConfiguration] =
    useReducer<ConfigurationReducer>(
      (state, { name, value }) => ({ ...state, [name]: value }),
      INITIAL_CONFIGURATION
    );

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (evt) => {
    updateConfiguration({
      name: evt.target.name,
      value: Number(evt.target.value),
    });
  };

  return { cols, max, rows, onChange, chance };
};

const ROW_COL_HEADER = "";

const oneIn = (chance: number) => {
  return Math.random() < 1 / chance;
};

const getRandom = ({ max, chance }: { max: number; chance: number }) => {
  const difference = 4;
  const base = Math.round((Math.random() * max) / difference);

  if (!oneIn(chance)) {
    return base;
  }

  const extra =
    Math.round((Math.random() * max) / difference) * (difference - 1);

  return base + extra;
};

export const useDataGeneration = ({
  cols,
  max,
  rows,
  chance,
}: Configuration) => {
  const data = useMemo(() => {
    return Array.from(Array(rows).keys()).map(() => {
      return Array.from(Array(cols).keys()).map(() => {
        return getRandom({ max, chance });
      });
    });
  }, [cols, max, rows, chance]);

  const columnHeaders = useMemo(() => {
    return [ROW_COL_HEADER].concat(
      Array.from(Array(cols).keys()).map((_, index) => `Column ${index + 1}`)
    );
  }, [cols]);

  const rowHeaders = useMemo(() => {
    return Array.from(Array(rows).keys()).map((_, index) => `Row ${index + 1}`);
  }, [rows]);

  return { data, columnHeaders, rowHeaders };
};
