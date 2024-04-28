import { type ZodObject, type ZodRawShape, type z } from "zod";
import { type Result } from "~/types/result";
import { type Brand } from "./typeSafety";

export type TfsValue<Value = unknown, Error = unknown> = {
    readonly parse: Parser<Value, Error>;
}

type TfsEntity = {
    name: string
}

export type Parser<OkType, ErrorType> = ((path: Path) => Promise<Result<OkType, ErrorType>>);

type ImageError = string;
export type TfsImage<T extends string> = {
    readonly type: "image";
} & TfsValue<Image<T>, ImageError>

export type TfsMarkdownWithContent<T extends ZodRawShape> = TfsValue<{
    html: string;
    asString: string;
    matters: z.infer<ZodObject<T>>;
}, "could not read file" | "invalid matter" | MarkdownError> & {type: "markdownWithContent"};


export type MarkdownWithMatter = (namePattern?: string) => <T extends ZodRawShape>(matters: ZodObject<T>) => TfsMarkdownWithContent<T>;
export type Markdown = { type: "markdown", path: Path } & TfsEntity;
export type MarkdownError = "no matches" | "invalid name";
export type TfsMarkdown = {
    withMatter: ReturnType<MarkdownWithMatter>,
    readonly type: "markdown";
} & TfsValue<Markdown, MarkdownError>

export const couldNotReadDirectory = "could not read directory";

export type ObjectWithName<T extends TfsRecord> = (namePattern?: string) => TfsObjectWithName<T>;
export interface TfsObject<T extends TfsRecord>
    extends TfsValue<InferTfsObject<T>, "no matches" | typeof couldNotReadDirectory>
{
    readonly type: "object";
    readonly withName: ObjectWithName<T>;
}
type UrlError = "no matches" | "invalid url" | "invalid extension" | "could not read file";

export type TfsUrl = {
    readonly type: "url";
    readonly parse: Parser<Url, UrlError>;
} & TfsValue<Url, UrlError>

export type ArrayWithName<ElementType extends TfsValue> = (namePattern?: string) => TfsArrayWithName<ElementType>;
export interface TfsArray<ElementType extends TfsValue<unknown, unknown>>
    extends TfsValue<(InferOk<ElementType>)[], "empty array" | typeof couldNotReadDirectory>
{
    readonly type: "array";
    readonly withName: ArrayWithName<ElementType>;
}

export interface TfsUnion<T extends Readonly<[...TfsValue<unknown, unknown>[]]>>
    extends TfsValue<InferTfsUnion<T>, "no matches">
{
    readonly type: "union";
}

type Url = { type: "url", value: string } & TfsEntity

type Image<ImagePathSplitType extends string> = {
    type: "image",
    url: `${string}${ImagePathSplitType}/${string}`
    width: number,
    height: number
} & TfsEntity;
export type Path = Brand<string, "path">;


export type InferTfsObject<T extends TfsRecord> = {
    [Key in keyof T]: InferOk<T[Key]>;
};

type ParseInt<T> = T extends `${infer N extends number}` ? N : never

 // @ts-expect-error TS does not recognize number indices as real indices
export type ArrayIndices<T extends Readonly<[...TfsValue<unknown, unknown>[]]>> = {[Key in Exclude<keyof T, keyof Array<unknown>>]: ParseInt<Key>}[ParseInt<Exclude<keyof T, keyof Array<unknown>>>]

type InferTfsUnion<T extends Readonly<[...TfsValue<unknown, unknown>[]]>> = {
    [Key in ArrayIndices<T>]: {
        option: Key,
        value: InferOk<T[Key]>}
}[ArrayIndices<T>]

export type InferOk<T extends TfsValue<unknown, unknown>> =  T extends TfsValue<infer OkType, unknown> ? OkType : never;
export type InferError<T extends TfsValue<unknown, unknown>> = T extends TfsValue<unknown, infer ErrorType> ? ErrorType : never;

export type TfsRecord = Record<string, TfsValue<unknown, unknown>>;

type InferTfsObjectWithName<T extends TfsRecord> = {
    name: string,
    parsed: InferTfsObject<T>
};

type InferTfsArrayWithName<T extends TfsValue> = {
    name: string,
    parsed: InferOk<TfsArray<T>>
};

export interface TfsArrayWithName<T extends TfsValue<unknown, unknown>> extends TfsValue<InferTfsArrayWithName<T>, "name does not match" | InferError<TfsArray<T>>>
{
    readonly type: "arrayWithName";
}

export interface TfsObjectWithName<T extends TfsRecord>
extends TfsValue<InferTfsObjectWithName<T>, "no matches" | "name does not match" | typeof couldNotReadDirectory>
{
    readonly type: "objectWithName";
}
