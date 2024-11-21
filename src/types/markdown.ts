import { z, ZodObject, ZodRawShape } from "zod";
import { TfsValue } from "./value";
import { TfsEntity } from "./entity";
import { Path } from "~/types/helpers";

export type TfsMarkdownWithContent<T extends ZodRawShape> = TfsValue<
  {
    html: string;
    asString: string;
    matters: z.infer<ZodObject<T>>;
  },
  "could not read file" | "invalid matter" | MarkdownError
>;

export type MarkdownWithMatter = (
  namePattern?: string
) => <T extends ZodRawShape>(
  matters: ZodObject<T>
) => TfsMarkdownWithContent<T>;
export type Markdown = { path: Path } & TfsEntity;
export type MarkdownError = "no matches" | "invalid extension";
export type TfsMarkdown = {
  withMatter: ReturnType<MarkdownWithMatter>;
} & TfsValue<Markdown, MarkdownError>;
