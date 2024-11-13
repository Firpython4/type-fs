import { couldNotReadDirectory, InferOk } from "./helpers";
import { ParserWithName, TfsAnyValue, TfsValue } from "./value";

export interface TfsArray<ElementType extends TfsAnyValue>
  extends TfsValue<InferArrayOk<ElementType>, typeof couldNotReadDirectory> {
  readonly withName: ParserWithName<

    InferArrayOk<ElementType>,
    typeof couldNotReadDirectory
  >;
}

export type InferArrayOk<ElementType extends TfsAnyValue> = Array<
  InferOk<ElementType>
>;
