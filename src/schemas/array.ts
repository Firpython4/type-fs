import { error, ok, type Result, type ExtractOkType } from "../result";
import {
  type Path,
  type TfsArray,
  type TfsAnyValue,
  type Parser,
  type InferOk,
  type InferError,
  couldNotReadDirectory,
} from "../types";
import { safeReadDir, getPath } from "../fileManagement";
import { errorHandler, withNameHandler, optionalWrapper } from "./common";

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
      dirents.okValue.map(async (dirent) =>
        element.parse(getPath(dirent, path)),
      ),
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

export const array = <ElementType extends TfsAnyValue>(
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
