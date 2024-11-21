import { Result } from "~/result";
import { Path } from "~/types/helpers";

export type TfsValueWithName<NewOkType, NewErrorType> = TfsValue<
  {
    name: string;
    parsed: NewOkType;
  },
  NewErrorType | "name does not match"
>;

export type TfsOptional<OkType> = TfsValue<OkType | undefined, unknown> & { isOptional: true };

type OptionalMixin<T> = {
  optional: () => TfsOptional<T>;
  isOptional: boolean;
};

export type Parser<OkType, ErrorType> = (
  path: Path
) => Promise<Result<OkType, ErrorType>> | Result<OkType, ErrorType>;

export type ParserWithName<OkType, ErrorType> = (
  pattern?: string
) => TfsValueWithName<OkType, ErrorType>;

export type TfsValue<Ok, Error> = {
  withErrorHandler: (handler: (error: Error) => void) => TfsValue<Ok, Error>;
  readonly withName: ParserWithName<Ok, Error>;
  readonly parse: Parser<Ok, Error>;
} & OptionalMixin<Ok>;

export type TfsAnyValue = TfsValue<unknown, unknown>;