import { TfsAnyValue } from "~/types/value";
import { ArrayIndices, TfsUnion } from "~/types/union";
import { error, ok } from "~/result";
import { InferOk, Path } from "~/types/helpers";
import { errorHandler, optionalWrapper, withNameHandler } from "~/wrappers";

const union = <T extends Readonly<[...TfsAnyValue[]]>>(
  ...types: T
): TfsUnion<T> => {
  const schema: TfsUnion<T> = {
    withErrorHandler: (handler) => errorHandler(schema, handler),
    withName: (namePattern?: string) => withNameHandler(schema, namePattern),
    optional: () => optionalWrapper(schema),
    isOptional: false,
    async parse(path: Path) {
      for (const [option, type] of types.entries()) {
        const typeSafeIndex = option as ArrayIndices<T>;

        const parseResult = await type.parse(path);

        if (!parseResult.wasResultSuccessful) {
          continue;
        }

        return ok({
          option: typeSafeIndex,
          value: parseResult.okValue as InferOk<T[ArrayIndices<T>]>,
        });
      }

      return error("no matches" as const);
    },
  };

  return schema;
};

export default union;