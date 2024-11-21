import { InferTfsObject, TfsObject, TfsRecord } from "~/types/object";
import { errorHandler, optionalWrapper, withNameHandler } from "~/wrappers";
import { Parser } from "~/types/value";
import { getPath, safeReadDir } from "~/fileManagement";
import { error, ok, type Result } from "~/result";
import { couldNotReadDirectory, Path } from "~/types/helpers";

const objectParse =
  <T extends TfsRecord>(
    fields: T
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
        })
      );

      const filtered = result.filter(
        (
          value: PromiseSettledResult<ResultType>
        ): value is PromiseFulfilledResult<ResultType> =>
          value.status === "fulfilled"
      );
      const valueMapped = filtered.map((value) => value.value);
      const okValues = valueMapped.filter(
        (value): value is { wasResultSuccessful: true; okValue: NewRecordType } =>
          value.wasResultSuccessful
      );
      const mapped = okValues.map((value) => value.okValue);

      if (okValues.length !== result.length) {
        return error("no matches" as const);
      }

      const spread = mapped.reduce(
        (previous, current) =>
          Object.assign(previous, current) as Record<KeyType, unknown>,
        {}
      ) as InferTfsObject<T>;
      return ok(spread);
    };

const object = <T extends TfsRecord>(fields: T): TfsObject<T> => {
  const schema: TfsObject<T> = {
    withErrorHandler: (handler) => errorHandler(schema, handler),
    parse: objectParse(fields),
    optional: () => optionalWrapper(schema),
    isOptional: false,
    withName: (pattern?: string) => withNameHandler(schema, pattern)
  };

  return schema;
};

export default object;
