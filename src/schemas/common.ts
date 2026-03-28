import {
  type Path,
  type TfsValue,
  type TfsValueWithName,
  type TfsOptional,
  type TfsAnyValue,
} from "../types";
import { error, map, type Result } from "../result";
import path from "node:path";

export function errorHandler<OkValue, ErrorValue>(
  parser: TfsValue<OkValue, ErrorValue>,
  handler: (error: ErrorValue, inPath: Path) => void,
) {
  const { parse, ...rest } = parser;
  return {
    ...rest,
    parse: async (path: Path) => {
      const result = await parser.parse(path);
      if (!result.wasResultSuccessful) {
        handler(result.errorValue, path);
      }

      return result;
    },
  };
}

export function withNameHandler<OkType, ErrorType>(
  schema: TfsValue<OkType, ErrorType>,
  namePattern?: string,
) {
  const { parse, withErrorHandler, ...rest } = schema;
  const newSchema: TfsValueWithName<OkType, ErrorType> = {
    ...rest,
    withErrorHandler: (handler) => errorHandler(newSchema, handler),
    withName: (namePattern?: string) => withNameHandler(newSchema, namePattern),
    optional: () => optionalWrapper(newSchema),
    async parse(inPath: Path) {
      const name = path.basename(inPath, path.extname(inPath));
      if (namePattern !== undefined) {
        const matches = name.match(namePattern);
        if (matches === null) {
          return error("name does not match" as const);
        }
      }

      const parseResult = await schema.parse(inPath);
      return map(parseResult, (okParse) => ({ name, parsed: okParse }));
    },
  };

  return newSchema;
}

export function optionalWrapper<T extends TfsValue<OkType, unknown>, OkType>(
  schema: T,
) {
  const newSchema: TfsOptional<OkType> = {
    ...schema,
    isOptional: true,
    withErrorHandler: (_handler) => newSchema,
    withName: (namePattern?: string) => withNameHandler(newSchema, namePattern),
  };

  return newSchema;
}

export function getName(inPath: Path) {
  return path.basename(inPath, path.extname(inPath));
}
