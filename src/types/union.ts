import { InferOk } from "./helpers";
import { TfsAnyValue, TfsValue } from "./value";

type ParseInt<T> = T extends `${infer N extends number}` ? N : never;


// @ts-expect-error TS does not recognize number indices as real indices
export type ArrayIndices<T extends Readonly<[...TfsAnyValue[]]>> = {
  [Key in Exclude<keyof T, keyof Array<unknown>>]: ParseInt<Key>;
}[ParseInt<Exclude<keyof T, keyof Array<unknown>>>];

type InferTfsUnion<T extends Readonly<[...TfsAnyValue[]]>> = {
  [Key in ArrayIndices<T>]: {
    option: Key;
    value: InferOk<T[Key]>;
  };
}[ArrayIndices<T>];

export type TfsUnion<T extends Readonly<[...TfsAnyValue[]]>> = TfsValue<
  InferTfsUnion<T>,
  "no matches"
>;
