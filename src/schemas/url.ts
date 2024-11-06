import { ok } from "assert";
import { error } from "console";
import path from "path";
import { z } from "zod";
import { sizeOfAsync } from "~/fileManagement";
import { TfsImage } from "~/types/image";
import { TfsUrl } from "~/types/url";
import { getUrlFromPath } from "./schemas";
import { Path } from "~/types/types";

const url = (): TfsUrl => {
  const schema: TfsUrl = {
    withErrorHandler: (handler) => errorHandler(schema, handler),
    withName: (namePattern?: string) => withNameHandler(schema, namePattern),
    optional: () => optionalWrapper(schema),
    isOptional: false,
    parse: async (pathToParse) => {
      const extension = ".url";
      const ext = path.extname(pathToParse).toLowerCase();
      if (ext !== extension) {
        return error("invalid extension" as const);
      }

      const url = await getUrlFromPath(pathToParse);

      if (!url.wasResultSuccessful) {
        return error(url.errorValue);
      }

      const urlOkValue = url.okValue;
      const parseResult = z.string().url().safeParse(urlOkValue);
      if (!parseResult.success) {
        return error("invalid url" as const);
      }

      return ok({
        type: "url",
        name: getName(pathToParse),
        url: urlOkValue,
      });
    },
  };

  return schema;
};

const image = (linkCutoff?: string): TfsImage => {
  const schema: TfsImage = {
    withErrorHandler: handler => errorHandler(schema, handler),
    withName: (namePattern?: string) => withNameHandler(schema, namePattern),
    optional: () => optionalWrapper(schema),
    isOptional: false,
    parse: async (inPath: Path) => {
      const extensions = [".jpg", ".webp", ".png", ".svg", ".ico", ".jpeg"];
      const extension = path.extname(inPath).toLowerCase();

      if (!extensions.includes(extension)) {
        return error("invalid extension" as const);
      }

      let url = inPath.replaceAll("\\", "/");
      if (linkCutoff) {
        const split = url.split(linkCutoff)[1];
        if (!split) {
          return error("image is not in the configured folder" as const);
        }
        url = split;
      }

      const size = await sizeOfAsync(inPath);

      if (!size.wasResultSuccessful) {
        return error(`Unable to read file ${inPath}`);
      }

      const sizeValue = size.okValue;

      if (!sizeValue) {
        return error(`Unable to read file ${inPath}`);
      }

      if (sizeValue.width === undefined) {
        return error(`Invalid image width for ${inPath}`);
      }
      if (sizeValue.height === undefined) {
        return error(`Invalid image height for ${inPath}`);
      }

      return ok({
        type: "image",
        name: getName(inPath),
        width: sizeValue.width,
        height: sizeValue.height,
        url: url,
      });
    },
  };
  return schema;
};
