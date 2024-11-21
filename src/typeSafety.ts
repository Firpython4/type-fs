export type StringWithInnerSubstring<Str extends string> =
  `${NonEmptyString}${Str}${NonEmptyString}`;

export function includesInner<Str extends string>(
  stringValue: string,
  searchString: Str
): stringValue is StringWithInnerSubstring<Str> {
  return (
    stringValue.includes(searchString) &&
    !stringValue.endsWith(searchString) &&
    !stringValue.startsWith(searchString)
  );
}

export type NonEmptyString = Exclude<string, "">;

export type Brand<K, T> = K & { __brand: T };
