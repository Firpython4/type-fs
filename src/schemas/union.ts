import { error, ok } from "../result";
import {
  type Path,
  type TfsUnion,
  type TfsAnyValue,
  type ArrayIndices,
  type InferOk,
} from "../types";
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { errorHandler, withNameHandler, optionalWrapper } from "./common";

export const union = <T extends Readonly<[...TfsAnyValue[]]>>(
  ...types: T
): TfsUnion<T> => {
  const schema: TfsUnion<T> = {
    withErrorHandler: (handler) => errorHandler(schema, handler),
    withName: (namePattern?: string) => withNameHandler(schema, namePattern),
    optional: () => optionalWrapper(schema),
    isOptional: false,
    async parse(path: Path) {
      try {
        await access(path, constants.R_OK);
      } catch {
        return error("file does not exist" as const);
      }

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
