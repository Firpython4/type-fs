import { type ZodObject, type ZodRawShape, type z } from "zod";
import { type Brand } from "./typeSafety";
import { type Result } from "./result";
import { type Buffer } from "node:buffer";

export type TfsValue<Ok, Error> = {
  withErrorHandler: (handler: (error: Error) => void) => TfsValue<Ok, Error>;
  readonly withName: ParserWithName<Ok, Error>;
  readonly parse: Parser<Ok, Error>;
} & OptionalMixin<Ok>;

type TfsEntity = {
  name: string;
};

export type Parser<OkType, ErrorType> = (
  path: Path,
) => Promise<Result<OkType, ErrorType>> | Result<OkType, ErrorType>;

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

export type TypeOfZodObject<T extends ZodRawShape> = ReturnType<typeof z.object<T>>;

export type MarkdownWithMatter = (
  namePattern?: string,
) => <T extends ZodRawShape>(
  matters: TypeOfZodObject<T>
) => TfsMarkdownWithContent<T>;
export type Markdown = { path: Path } & TfsEntity;
export type MarkdownError = "no matches" | "invalid extension" | "could not read file";
export type TfsMarkdown = {
  withMatter: ReturnType<MarkdownWithMatter>;
} & TfsValue<Markdown, MarkdownError>;

export const couldNotReadDirectory = "could not read directory" as const;

export type TfsTextFile = TfsValue<
  Buffer,
  "no matches" | "could not read file"
>;

export type TfsAnyValue = TfsValue<unknown, unknown>;

export type TfsValueWithName<NewOkType, NewErrorType> = TfsValue<
  {
    name: string;
    parsed: NewOkType;
  },
  NewErrorType | "name does not match"
>;

type ParserWithName<OkType, ErrorType> = (
  pattern?: string,
) => TfsValueWithName<OkType, ErrorType>;

export type TfsObject<T extends TfsRecord> = TfsValue<
  InferTfsObject<T>,
  "no matches" | typeof couldNotReadDirectory
>;

type UrlError =
  | "no matches"
  | "invalid url"
  | "invalid extension"
  | "could not read file";

type OptionalMixin<T> = {
  optional: () => TfsOptional<T>;
  isOptional: boolean;
};

export type TfsUrl = TfsValue<Url, UrlError>;

export type InferArrayOk<ElementType extends TfsAnyValue> = Array<
  InferOk<ElementType>
>;

export interface TfsArray<ElementType extends TfsAnyValue>
  extends TfsValue<InferArrayOk<ElementType>, typeof couldNotReadDirectory> {
  readonly withName: ParserWithName<
    InferArrayOk<ElementType>,
    typeof couldNotReadDirectory
  >;
}

export type TfsUnion<T extends Readonly<[...TfsAnyValue[]]>> = TfsValue<
  InferTfsUnion<T>,
  "no matches" | "file does not exist"
>;

export type TfsOptional<OkType> = TfsValue<OkType | undefined, unknown> & { isOptional: true };

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
