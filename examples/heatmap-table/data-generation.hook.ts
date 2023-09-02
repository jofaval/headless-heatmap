import { Reducer, useReducer } from "react";

const INITIAL_CONFIGURATION = { rows: 10, cols: 10, max: 20 };
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

export const useDataGeneration = ({ cols, max, rows }: Configuration) => {
  const data = Array.from(Array(rows).keys()).map(() => {
    return Array.from(Array(cols).keys()).map(() => {
      return Math.floor(Math.random() * max);
    });
  });

  const columnHeaders = Array.from(Array(rows).keys()).map(
    (_, index) => `Column ${index + 1}`
  );
  const rowHeaders = Array.from(Array(cols).keys()).map(
    (_, index) => `Row ${index + 1}`
  );

  return { data, columnHeaders, rowHeaders };
};
