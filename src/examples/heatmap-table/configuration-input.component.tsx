export const capitalize = <T extends string>(
  text: T
): Capitalize<Lowercase<T>> => {
  const transformed =
    text.charAt(0).toLocaleUpperCase() + text.substring(1).toLocaleLowerCase();

  return transformed as Capitalize<Lowercase<T>>;
};

export function Input({
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
      <label htmlFor={name}>{capitalize(name)}</label>

      <input
        name={name}
        id={name}
        type="number"
        onChange={onChange}
        value={value}
        max={Number.MAX_SAFE_INTEGER}
      />
    </div>
  );
}
