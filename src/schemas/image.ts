import { TfsImage } from "~/types/image";
import { Path } from "~/types/helpers";
import path from "path";
import { getName, sizeOfAsync } from "~/fileManagement";
import { errorHandler, optionalWrapper, withNameHandler } from "~/wrappers";
import { error, ok } from "~/result";

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

export default image;