import { type ZodObject, type ZodRawShape, type z } from "zod";
import { type Brand } from "./typeSafety";
import { type Result } from "./result";

export type TfsValue<Ok, Error> = {
  withErrorHandler: (handler: (error: Error) => void) => TfsValue<Ok, Error>;
  readonly parse: Parser<Ok, Error>;
} & OptionalMixin<Ok>;

type TfsEntity = {
  name: string;
};

export type Parser<OkType, ErrorType> = (
  path: Path,
) => Promise<Result<OkType, ErrorType>>;

type ImageError = string;
export type TfsImage = TfsValue<Image, ImageError>;

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
export type Markdown = { type: "markdown"; path: Path } & TfsEntity;
export type MarkdownError = "no matches" | "invalid name";
export type TfsMarkdown = {
  withMatter: ReturnType<MarkdownWithMatter>;
} & TfsValue<Markdown, MarkdownError>;

export const couldNotReadDirectory = "could not read directory" as const;

export type TfsAnyValue = TfsValue<unknown, unknown>;

export type TfsValueWithName<NewOkType, NewErrorType> = TfsValue<
  {
    name: string;
    parsed: NewOkType;
  },
  NewErrorType | "name does not match"
>;

type ParserWithName<T extends TfsAnyValue> = (
  pattern?: string,
) => TfsValueWithName<InferOk<T>, InferError<T>>;

export interface TfsObject<T extends TfsRecord>
  extends TfsValue<
    InferTfsObject<T>,
    "no matches" | typeof couldNotReadDirectory
  > {
  readonly withName: ParserWithName<TfsObject<T>>;
}
type UrlError =
  | "no matches"
  | "invalid url"
  | "invalid extension"
  | "could not read file";

type OptionalMixin<T> = {
  optional: () => TfsOptional<T>;
};

export type TfsUrl = TfsValue<Url, UrlError>;

export type InferArrayOk<ElementType extends TfsAnyValue> = Array<
  InferOk<ElementType>
>;

export interface TfsArray<ElementType extends TfsAnyValue>
  extends TfsValue<InferArrayOk<ElementType>, typeof couldNotReadDirectory> {
  readonly withName: ParserWithName<TfsArray<ElementType>>;
}

export type TfsUnion<T extends Readonly<[...TfsAnyValue[]]>> = TfsValue<
  InferTfsUnion<T>,
  "no matches"
>;

export type TfsOptional<OkType> = TfsValue<OkType | undefined, never>;

type Url = { url: string } & TfsEntity;

type Image = {
  type: "image";
  url: string;
  width: number;
  height: number;
} & TfsEntity;
export type Path = Brand<string, "path">;

export type InferTfsObject<T extends TfsRecord> = {
  [Key in keyof T]: InferOk<T[Key]>;
};

type ParseInt<T> = T extends `${infer N extends number}` ? N : never;

// @ts-expect-error TS does not recognize number indices as real indices
export type ArrayIndices<T extends Readonly<[...TfsAnyValue[]]>> = {
  [Key in Exclude<keyof T, keyof Array<unknown>>]: ParseInt<Key>;
}[ParseInt<Exclude<keyof T, keyof Array<unknown>>>];

type InferTfsUnion<T extends Readonly<[...TfsAnyValue[]]>> = {
  [Key in ArrayIndices<T>]: {
    option: Key;
    value: InferOk<T[Key]>;
  };
}[ArrayIndices<T>];

export type InferOk<T extends TfsAnyValue> =
  T extends TfsValue<infer OkType, unknown> ? OkType : never;
export type InferError<T extends TfsAnyValue> =
  T extends TfsValue<unknown, infer ErrorType> ? ErrorType : never;

export type TfsRecord = Record<string, TfsAnyValue>;
