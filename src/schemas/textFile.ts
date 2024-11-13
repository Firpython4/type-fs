import path from "node:path";
import { error, ok } from "~/result";
import { readFileSafe } from "~/fileManagement";
import { TfsTextFile } from "~/types/textFile";
import { errorHandler, optionalWrapper, withNameHandler } from "~/wrappers";

const textFile = (): TfsTextFile => {
  const schema: TfsTextFile = {
    withErrorHandler: (handler) => errorHandler(schema, handler),
    withName: (namePattern?: string) => withNameHandler(schema, namePattern),
    optional: () => optionalWrapper(schema),
    isOptional: false,
    async parse(inPath) {
      const txtExtension = ".txt";
      const extension = path.extname(inPath).toLowerCase();
      if (extension !== txtExtension) {
        return error("no matches" as const);
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

export default textFile;
