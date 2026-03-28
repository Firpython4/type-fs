import { error, ok } from "../result";
import { type Path, type TfsTextFile } from "../types";
import path from "node:path";
import { readFileSafe } from "../fileManagement";
import { errorHandler, withNameHandler, optionalWrapper } from "./common";

export const textFile = (): TfsTextFile => {
  const schema: TfsTextFile = {
    withErrorHandler: (handler) => errorHandler(schema, handler),
    withName: (namePattern?: string) => withNameHandler(schema, namePattern),
    optional: () => optionalWrapper(schema),
    isOptional: false,
    async parse(inPath: Path) {
      const txtExtension = ".txt";
      const extension = path.extname(inPath).toLowerCase();
      if (extension !== txtExtension) {
        return error("invalid extension" as const);
      }

      const contentFile = await readFileSafe(inPath);

      if (!contentFile.wasResultSuccessful) {
        return error("could not read file" as const);
      }

      return ok(contentFile.okValue);
    },
  };

  return schema;
};
