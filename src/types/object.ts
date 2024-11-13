import { couldNotReadDirectory, InferOk } from "./helpers";
import { TfsAnyValue, TfsValue } from "./value";

export type InferTfsObject<T extends TfsRecord> = {
  [Key in keyof T]: InferOk<T[Key]>;
};

export type TfsRecord = Record<string, TfsAnyValue>;

export type TfsObject<T extends TfsRecord> = TfsValue<
  InferTfsObject<T>,
  "no matches" | typeof couldNotReadDirectory
>;
