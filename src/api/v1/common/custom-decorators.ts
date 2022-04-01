import { Transform } from "class-transformer";

export function Default(defaultValue: any) {
  return Transform((value: any) =>
    value !== null && value !== undefined ? value : defaultValue
  );
}
export function ToBoolean(): (target: any, key: string) => void {
  return Transform(
    (value: any) =>
      value === "true" || value === true || value === 1 || value === "1"
  );
}