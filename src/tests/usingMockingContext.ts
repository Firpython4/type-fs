import { using, usingAsync } from "~/tests/using";
import { type FileMockingContext } from "~/tests/mocking/fileMocking";

export function usingFileMockerAsync(context: FileMockingContext, func: () => Promise<void>) {
  return usingAsync(context, func, () => context.cleanup());
}
export function usingFileMocker(context: FileMockingContext, func: () => void) {
  return using(context, func, () => context.cleanup());
}
