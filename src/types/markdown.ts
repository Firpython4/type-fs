import { z, ZodObject, ZodRawShape } from "zod";
import { TfsValue } from "./value";
import { Path } from "./types";
import { TfsEntity } from "./entity";

export type TfsMarkdownWithContent<T extends ZodRawShape> = TfsValue<
  {
    html: string;
    asString: string;
    matters: z.infer<ZodObject<T>>;
  },
  "could not read file" | "invalid matter" | MarkdownError
>;

export type MarkdownWithMatter = (
  namePattern?: string,
) => <T extends ZodRawShape>(
  matters: ZodObject<T>,
) => TfsMarkdownWithContent<T>;
export type Markdown = { path: Path } & TfsEntity;
export type MarkdownError = "no matches";
export type TfsMarkdown = {
  withMatter: ReturnType<MarkdownWithMatter>;
} & TfsValue<Markdown, MarkdownError>;
