import { error, ok, map } from "../result";
import { type Path, type TfsUrl } from "../types";
import { z } from "zod";
import path from "node:path";
import { readFileSafe } from "../fileManagement";
import {
  errorHandler,
  withNameHandler,
  optionalWrapper,
  getName,
} from "./common";

export async function getUrl(imageOrUrlPath: Path) {
  const { readFile } = await import("node:fs/promises");
  return (await readFile(imageOrUrlPath)).toString();
}

export async function getUrlFromPath(path: Path) {
  return map(await readFileSafe(path), (value) => value.toString());
}

export const url = (): TfsUrl => {
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
