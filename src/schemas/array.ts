import { Parser, TfsAnyValue } from "~/types/value";
import { InferError, InferOk } from "~/types/helpers";
import { TfsArray } from "~/types/array";
import { couldNotReadDirectory, Path } from "~/types/helpers";
import { getPath, safeReadDir } from "~/fileManagement";
import { error, type ExtractOkType, ok, type Result } from "~/result";
import { errorHandler, optionalWrapper, withNameHandler } from "~/wrappers";

const arrayParse =
  <ElementType extends TfsAnyValue>(
    element: ElementType,
  ): Parser<InferOk<ElementType>[], InferError<TfsArray<ElementType>>> =>
    async (path: Path) => {
      const dirents = await safeReadDir(path);

      if (!dirents.wasResultSuccessful) {
        return error(couldNotReadDirectory);
      }

      const mapped = await Promise.allSettled(
        dirents.okValue.map(async (dirent) => element.parse(getPath(dirent))),
      );
      const filtered = mapped.filter(
        (
          parsed,
        ): parsed is PromiseFulfilledResult<
          ExtractOkType<Result<unknown, unknown>>
        > => parsed.status === "fulfilled" && parsed.value.wasResultSuccessful,
      );
      const remapped = filtered.map(
        (parsed) => parsed.value.okValue,
      ) as InferOk<ElementType>[];

      return ok(remapped);
    };

const array = <ElementType extends TfsAnyValue>(
  element: ElementType,
): TfsArray<ElementType> => {
  const schema: TfsArray<ElementType> = {
    withErrorHandler: (handler) => errorHandler(schema, handler),
    withName: (namePattern?: string) => withNameHandler(schema, namePattern),
    parse: arrayParse(element),
    optional: () => optionalWrapper(schema),
    isOptional: false,
  };
  return schema;
};

export default array;