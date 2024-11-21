import { error, map } from "~/result";
import path from "node:path";
import { TfsOptional, TfsValue, TfsValueWithName } from "~/types/value";
import { Path } from "~/types/helpers";

export function errorHandler<OkValue, ErrorValue>(
  parser: TfsValue<OkValue, ErrorValue>,
  handler: (error: ErrorValue, inPath: Path) => void
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { parse, ...rest } = parser;
  return {
    ...rest,
    parse: async (path: Path) => {
      const result = await parser.parse(path);
      if (!result.wasResultSuccessful) {
        handler(result.errorValue, path);
      }

      return result;
    }
  };
}

export function withNameHandler<OkType, ErrorType>(
  schema: TfsValue<OkType, ErrorType>,
  namePattern?: string
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { parse, withErrorHandler, ...rest } = schema;
  const newSchema: TfsValueWithName<OkType, ErrorType> = {
    ...rest,
    withErrorHandler: (handler) => errorHandler(newSchema, handler),
    withName: (namePattern?: string) => withNameHandler(newSchema, namePattern),
    optional: () => optionalWrapper(newSchema),
    async parse(inPath: Path) {
      const name = path.basename(inPath);
      if (namePattern !== undefined) {
        const matches = name.match(namePattern);
        if (matches === null) {
          return error("name does not match" as const);
        }
      }

      const parseResult = await schema.parse(inPath);
      return map(parseResult, (okParse) => ({ name, parsed: okParse }));
    }
  };

  return newSchema;
}

export function optionalWrapper<T extends TfsValue<OkType, unknown>, OkType>(
  schema: T
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const newSchema: TfsOptional<OkType> = {
    ...schema,
    isOptional: true,
    withErrorHandler: (_handler) => newSchema,
    withName: (namePattern?: string) => withNameHandler(newSchema, namePattern)
  };

  return newSchema;
}
