import { Brand } from "~/typeSafety";
import { TfsAnyValue, TfsValue } from "./value";

export const couldNotReadDirectory = "could not read directory" as const;

export type TfsTextFile = TfsValue<
  Buffer,
  "no matches" | "could not read file"
>;

export type Path = Brand<string, "path">;
