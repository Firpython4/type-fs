import { error, ok, type Result } from "../result";
import {
  type Path,
  type TfsObject,
  type TfsRecord,
  type Parser,
  type InferTfsObject,
  couldNotReadDirectory,
} from "../types";
import { safeReadDir, getPath } from "../fileManagement";
import { errorHandler, withNameHandler, optionalWrapper } from "./common";

type KeyType = string | number | symbol;

const objectParse =
  <T extends TfsRecord>(
    fields: T,
  ): Parser<InferTfsObject<T>, typeof couldNotReadDirectory | "no matches"> =>
  async (path: Path) => {
    const dirents = await safeReadDir(path);
    if (!dirents.wasResultSuccessful) {
      return error(couldNotReadDirectory);
    }

    type NewRecordType = {
      [Key in keyof T]: unknown;
    };

    type ResultType = Result<NewRecordType, "no matches">;

    const result = await Promise.allSettled(
      Object.entries(fields).map(async ([key, value]) => {
        for (const dirent of dirents.okValue) {
          const parsed = await value.parse(getPath(dirent));
          if (parsed.wasResultSuccessful) {
            return ok({ [key as KeyType]: parsed.okValue }) as ResultType;
          }
        }

        if (!value.isOptional) {
          return error("no matches" as const);
        }

        return ok({ [key as KeyType]: undefined }) as ResultType;
      }),
    );

    const filtered = result.filter(
      (
        value: PromiseSettledResult<ResultType>,
      ): value is PromiseFulfilledResult<ResultType> =>
        value.status === "fulfilled",
    );
    const valueMapped = filtered.map((value) => value.value);
    const okValues = valueMapped.filter(
      (value): value is { wasResultSuccessful: true; okValue: NewRecordType } =>
        value.wasResultSuccessful,
    );
    const mapped = okValues.map((value) => value.okValue);

    if (okValues.length !== result.length) {
      return error("no matches" as const);
    }

    const spread = mapped.reduce(
      (previous, current) =>
        Object.assign(previous, current) as Record<KeyType, unknown>,
      {},
    ) as InferTfsObject<T>;
    return ok(spread);
  };

export const object = <T extends TfsRecord>(fields: T): TfsObject<T> => {
  const schema: TfsObject<T> = {
    withErrorHandler: (handler) => errorHandler(schema, handler),
    parse: objectParse(fields),
    optional: () => optionalWrapper(schema),
    isOptional: false,
    withName: (pattern?: string) => withNameHandler(schema, pattern),
  };

  return schema;
};
