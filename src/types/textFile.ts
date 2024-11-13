import { TfsValue } from "~/types/value";

export type TfsTextFile = TfsValue<
  Buffer,
  "no matches" | "could not read file"
>;

