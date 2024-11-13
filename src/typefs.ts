import markdown from "~/schemas/markdown";
import textFile from "~/schemas/textFile";
import image from "~/schemas/image";
import union from "~/schemas/union";
import url from "./schemas/url";
import array from "~/schemas/array";
import object from "~/schemas/object";

export const typefs = {
  url,
  markdown,
  textFile,
  image,
  array,
  object,
  union,
};

export default typefs;