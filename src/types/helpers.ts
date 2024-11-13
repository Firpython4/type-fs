import { TfsAnyValue, TfsValue } from "./value";
import { Brand } from "~/typeSafety";

export type InferOk<T extends TfsAnyValue> =
  T extends TfsValue<infer OkType, unknown> ? OkType : never;
export type InferError<T extends TfsAnyValue> =
  T extends TfsValue<unknown, infer ErrorType> ? ErrorType : never;


export const couldNotReadDirectory = "could not read directory" as const;

export type Path = Brand<string, "path">;
