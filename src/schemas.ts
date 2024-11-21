import { error, type ExtractOkType, map, ok, type Result } from "./result";
import { type Buffer } from "node:buffer";
import {
  type Path,
  type TfsValue,
  type TfsUrl,
  type Parser,
  type InferOk,
  type TfsArray,
  type InferError,
  couldNotReadDirectory,
  type TfsImage,
  type TfsRecord,
  type InferTfsObject,
  type TfsObject,
  type TfsUnion,
  type ArrayIndices,
  type TfsMarkdown,
  type MarkdownWithMatter,
  type Markdown,
  type MarkdownError,
  type TfsMarkdownWithContent,
  type TfsAnyValue,
  type TfsValueWithName,
  type TfsOptional,
  type TfsTextFile,
} from "./types";
import { access, readFile } from "node:fs/promises";
import { z, type ZodObject, type ZodRawShape } from "zod";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import strip from "strip-markdown";
import {
  getPath,
  readFileSafe,
  safeReadDir,
  sizeOfAsync,
} from "./fileManagement";
import { constants, } from "node:fs";

const url = (): TfsUrl => {
  const schema: TfsUrl = {
    withErrorHandler: (handler) => errorHandler(schema, handler),
    withName: (namePattern?: string) => withNameHandler(schema, namePattern),
    optional: () => optionalWrapper(schema),
    isOptional: false,
    parse: async (pathToParse) => {
      const extension = ".url";
      const ext = path.extname(pathToParse).toLowerCase();
      if (ext !== extension) {
        return error("invalid extension" as const);
      }

      const url = await getUrlFromPath(pathToParse);

      if (!url.wasResultSuccessful) {
        return error(url.errorValue);
      }

      const urlOkValue = url.okValue;
      const parseResult = z.string().url().safeParse(urlOkValue);
      if (!parseResult.success) {
        return error("invalid url" as const);
      }

      return ok({
        type: "url",
        name: getName(pathToParse),
        url: urlOkValue,
      });
    },
  };
  return schema;
};

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

      try {
        await access(inPath, constants.R_OK);
      } catch {
        return error("could not read file" as const);
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

function getName(inPath: Path) {
  return path.basename(inPath, path.extname(inPath));
}

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

export async function getUrl(imageOrUrlPath: Path) {
  return (await readFile(imageOrUrlPath)).toString();
}

export async function getUrlFromPath(path: Path) {
  return map(await readFileSafe(path), (value) => value.toString());
}

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

        if (!value.isOptional)
        {
          return error("no matches" as const);
        }

        return ok({[key as KeyType]: undefined}) as ResultType;
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
function object<T extends TfsRecord>(fields: T): TfsObject<T> {
  const schema: TfsObject<T> = {
    withErrorHandler: (handler) => errorHandler(schema, handler),
    parse: objectParse(fields),
    optional: () => optionalWrapper(schema),
    isOptional: false,
    withName: (pattern?: string) => withNameHandler(schema, pattern),
  };

  return schema;
}

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

const parseMarkdownWithContent =
  <T extends ZodRawShape>(matters: ZodObject<T>) =>
  async (inPath: Path) => {
    const mdExtension = ".md";
    const extension = path.extname(inPath).toLowerCase();
    if (extension !== mdExtension) {
      return error("no matches" as const);
    }

    const contentFile = await readFileSafe(inPath);

    if (!contentFile.wasResultSuccessful) {
      return error("could not read file" as const);
    }

    const matterResult: matter.GrayMatterFile<Buffer> = matter(
      contentFile.okValue,
    );
    const processedContent = await remark()
      .use(html)
      .process(matterResult.content);

    const processedAsString = await remark()
      .use(strip)
      .process(matterResult.content);

    const matterData = matterResult.data;

    type RecordType = Record<string, unknown>;

    const newLineMapped = Object.entries(matterData).map(([key, value]) => {
      if (typeof value === "string") {
        return { [key]: value.replaceAll("\\n", "\n") };
      }

      return { [key]: value as unknown } as RecordType;
    });

    const newLineReplaced = newLineMapped.reduce(
      (previous, current) => Object.assign(previous, current),
      {},
    );

    if (matters.safeParse(matterData)) {
      return ok({
        matters: newLineReplaced as z.infer<typeof matters>,
        html: processedContent.toString(),
        asString: processedAsString.toString(),
      });
    } else {
      return error("invalid matter" as const);
    }
  };

const withMatter: MarkdownWithMatter =
  () =>
  <T extends ZodRawShape>(matters: ZodObject<T>) => {
    const schema: TfsMarkdownWithContent<T> = {
      withErrorHandler: (handler) => errorHandler(schema, handler),
      withName: (namePattern?: string) => withNameHandler(schema, namePattern),
      optional: () => optionalWrapper(schema),
      isOptional: false,
      parse: parseMarkdownWithContent(matters),
    };

    return schema;
  };

const parseMarkdown = (): Parser<Markdown, MarkdownError> =>
  async (inPath: Path) => {
    const mdExtension = ".md";
    const extension = path.extname(inPath).toLowerCase();
    if (extension !== mdExtension) {
      return error("invalid extension" as const);
    }

    try {
      await access(inPath, constants.R_OK);
    } catch {
      return error("could not read file" as const);
    }

    return ok({
      name: path.basename(inPath, path.extname(inPath)),
      path: inPath,
    });
  };

const markdown = (): TfsMarkdown => {
  const schema: TfsMarkdown = {
    withErrorHandler: (handler) => errorHandler(schema, handler),
    withName: (namePattern?: string) => withNameHandler(schema, namePattern),
    optional: () => optionalWrapper(schema),
    isOptional: false,
    withMatter: withMatter(),
    parse: parseMarkdown(),
  };

  return schema;
};

const textFile = (): TfsTextFile => {
  const schema: TfsTextFile = {
    withErrorHandler: (handler) => errorHandler(schema, handler),
    withName: (namePattern?: string) => withNameHandler(schema, namePattern),
    optional: () => optionalWrapper(schema),
    isOptional: false,
    async parse(inPath) {
      const txtExtension = ".txt";
      const extension = path.extname(inPath).toLowerCase();
      if (extension !== txtExtension) {
        return error("no matches" as const);
      }

      const contentFile = await readFileSafe(inPath);

      if (!contentFile.wasResultSuccessful) {
        return error("could not read file" as const);
      }

      return ok(contentFile.okValue);
    },
  };

  return schema;
};

export const typefs = {
  url,
  markdown,
  textFile,
  image,
  array,
  object,
  union,
};

function errorHandler<OkValue, ErrorValue>(
  parser: TfsValue<OkValue, ErrorValue>,
  handler: (error: ErrorValue, inPath: Path) => void,
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
    },
  };
}

function withNameHandler<OkType, ErrorType>(
  schema: TfsValue<OkType, ErrorType>,
  namePattern?: string,
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
    },
  };

  return newSchema;
}

function optionalWrapper<T extends TfsValue<OkType, unknown>, OkType>(
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
