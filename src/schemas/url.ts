import path from "path";
import { z } from "zod";
import { TfsUrl } from "~/types/url";
import { errorHandler, optionalWrapper, withNameHandler } from "~/wrappers";
import { error, ok } from "~/result";
import { getName, getUrlFromPath } from "~/fileManagement";

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
        url: urlOkValue
      });
    }
  };

  return schema;
};

export default url;
