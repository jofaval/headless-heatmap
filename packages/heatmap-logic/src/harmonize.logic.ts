// TODO: use a better system, look at highcharts for reference

export function harmonizeTens(value: number, steps: number): number[] {}
export function harmonizeHundreds(value: number, steps: number): number[] {}
export function harmonizeThousands(value: number, steps: number): number[] {}
export function harmonizeTensThousands(
  value: number,
  steps: number
): number[] {}
export function harmonizeHundredsThousands(
  value: number,
  steps: number
): number[] {}
export function harmonizeMillions(value: number, steps: number): number[] {}

export function harmonize(max: number, steps = 4) {
  let harmonizer: ((value: number, steps: number) => number[]) | undefined =
    undefined;
  if (max < 100) {
    harmonizer = harmonizeTens;
  } else if (max < 1_000) {
    harmonizer = harmonizeHundreds;
  } else if (max < 10_000) {
    harmonizer = harmonizeThousands;
  } else if (max < 100_000) {
    harmonizer = harmonizeTensThousands;
  } else if (max < 1_000_000) {
    harmonizer = harmonizeHundredsThousands;
  } else if (max < 10_000_000) {
    harmonizer = harmonizeMillions;
  }

  if (harmonizer === undefined) {
    throw new Error("");
  }

  return harmonizer(max, steps);
}
