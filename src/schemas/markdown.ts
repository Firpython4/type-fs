import { error, ok } from "../result";
import {
  type Path,
  type TfsMarkdown,
  type Parser,
  type Markdown,
  type MarkdownError,
  type MarkdownWithMatter,
  type TfsMarkdownWithContent,
} from "../types";
import { type ZodObject, type ZodRawShape, z } from "zod";
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import strip from "strip-markdown";
import { readFileSafe } from "../fileManagement";
import { errorHandler, withNameHandler, optionalWrapper } from "./common";

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

    const matterResult = matter(contentFile.okValue);
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

const parseMarkdown =
  (): Parser<Markdown, MarkdownError> => async (inPath: Path) => {
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

export const markdown = (): TfsMarkdown => {
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
