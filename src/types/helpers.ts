import { TfsAnyValue, TfsValue } from "./value";

export type InferOk<T extends TfsAnyValue> =
  T extends TfsValue<infer OkType, unknown> ? OkType : never;
export type InferError<T extends TfsAnyValue> =
  T extends TfsValue<unknown, infer ErrorType> ? ErrorType : never;
