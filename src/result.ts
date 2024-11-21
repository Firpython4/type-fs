export type Result<OkType, ErrorType> =
  | {
  wasResultSuccessful: true;
  okValue: OkType;
}
  | {
  wasResultSuccessful: false;
  errorValue: ErrorType;
};

export function ok<OkType>(okValue: OkType) {
  return {
    wasResultSuccessful: true as const,
    okValue
  };
}

export async function okAsync<OkType>(okValue: Promise<OkType>) {
  return {
    wasResultSuccessful: true as const,
    okValue: await okValue
  };
}

export function error<ErrorType>(errorValue: ErrorType) {
  return {
    wasResultSuccessful: false as const,
    errorValue
  };
}

export function map<OkType, ErrorType, NewOkType>(
  result: Result<OkType, ErrorType>,
  mapper: (okValue: OkType) => NewOkType
): Result<NewOkType, ErrorType> {
  if (result.wasResultSuccessful) {
    return ok(mapper(result.okValue));
  }

  return result;
}

export type ExtractOkType<T> =
  T extends Result<infer OkType, unknown>
    ? { wasResultSuccessful: true; okValue: OkType }
    : never;
export type ExtractOkTypeRaw<T> =
  T extends Result<infer OkType, unknown> ? OkType : never;
export type ExtractErrorType<T> =
  T extends Result<unknown, infer ErrorType>
    ? { wasResultSuccessful: false; errorValue: ErrorType }
    : never;
export type ExtractErrorTypeRaw<T> =
  T extends Result<unknown, infer ErrorType> ? ErrorType : never;
