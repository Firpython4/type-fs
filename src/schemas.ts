import { url, getUrl, getUrlFromPath } from "./schemas/url";
import { image } from "./schemas/image";
import { array } from "./schemas/array";
import { object } from "./schemas/object";
import { union } from "./schemas/union";
import { markdown } from "./schemas/markdown";
import { textFile } from "./schemas/textFile";

export { url, getUrl, getUrlFromPath };
export { image };
export { array };
export { object };
export { union };
export { markdown };
export { textFile };

export const typefs = {
  url,
  markdown,
  textFile,
  image,
  array,
  object,
  union,
};
