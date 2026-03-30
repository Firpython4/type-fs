import {
  type Path,
  type TfsValue,
  type TfsValueWithName,
  type TfsOptional,
} from "../types";
import { error, map } from "../result";
import path from "node:path";

export function errorHandler<OkValue, ErrorValue>(
  parser: TfsValue<OkValue, ErrorValue>,
  handler: (error: ErrorValue, inPath: Path) => void,
) {
  const rest = {
    withErrorHandler: parser.withErrorHandler,
    withName: parser.withName,
    optional: parser.optional,
    isOptional: parser.isOptional,
  };
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
  const rest = {
    withErrorHandler: schema.withErrorHandler,
    withName: schema.withName,
    optional: schema.optional,
    isOptional: schema.isOptional,
  };
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

export const __testExports__ = {
  errorHandler,
  withNameHandler,
  optionalWrapper,
  getName,
  createMockParser,
  createFailingParser,
};

export function createMockParser<T>(okValue: T, isOptional = false) {
  const mockParser = {
    parse: async () => ({ wasResultSuccessful: true, okValue }),
    withErrorHandler: (_handler: (error: unknown) => void) => mockParser,
    withName: (namePattern?: string) => {
      const named = {
        ...mockParser,
        parse: async (inPath: Path) => {
          const name = getName(inPath);
          const matches = namePattern ? name.match(namePattern) : null;
          if (namePattern && matches === null) {
            return {
              wasResultSuccessful: false,
              errorValue: "name does not match",
            };
          }
          return {
            wasResultSuccessful: true,
            okValue: { name, parsed: okValue },
          };
        },
        optional: () => createMockParser(okValue, true),
      };
      return named;
    },
    optional: () => createMockParser(okValue, true),
    isOptional,
  };
  return mockParser;
}

export function createFailingParser<T>(errorValue: T) {
  return {
    parse: async () => ({ wasResultSuccessful: false, errorValue }),
    withErrorHandler: (_handler: (error: T) => void) =>
      createFailingParser(errorValue),
    withName: () => createFailingParser(errorValue),
    optional: () => createFailingParser(errorValue),
    isOptional: false,
  };
}
