import { Reducer, useMemo, useReducer } from "react";

const INITIAL_CONFIGURATION = { rows: 100, cols: 20, max: 2_000 };
type Configuration = typeof INITIAL_CONFIGURATION;

type ConfigurationReducer = Reducer<
  Configuration,
  { name: string; value: number }
>;

export const useConfiguration = () => {
  const [{ cols, max, rows }, updateConfiguration] =
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

  return { cols, max, rows, onChange };
};

const ROW_COL_HEADER = "";

export const useDataGeneration = ({ cols, max, rows }: Configuration) => {
  const data = useMemo(() => {
    return Array.from(Array(rows).keys()).map(() => {
      return Array.from(Array(cols).keys()).map(() => {
        return Math.floor(Math.random() * max);
      });
    });
  }, [cols, max, rows]);

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
