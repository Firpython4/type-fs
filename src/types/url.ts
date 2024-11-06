import { TfsEntity } from "./entity";
import { TfsValue } from "./value";

type UrlError =
  | "no matches"
  | "invalid url"
  | "invalid extension"
  | "could not read file";

export type TfsUrl = TfsValue<Url, UrlError>;

type Url = { url: string } & TfsEntity;
