import { TfsEntity } from "./entity";
import { TfsValue } from "./value";

type Image = {
  type: "image";
  url: string;
  width: number;
  height: number;
} & TfsEntity;

type ImageError = string;
export type TfsImage = TfsValue<Image, ImageError>;
