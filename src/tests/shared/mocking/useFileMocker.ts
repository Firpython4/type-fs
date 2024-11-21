import { using, usingAsync } from "~/tests/shared/using";
import { type FileMocker } from "~/tests/shared/mocking/fileMocking";

export function usingFileMockerAsync(context: FileMocker, func: () => Promise<void>) {
  return usingAsync(context, func, () => context.cleanup());
}

export function usingFileMocker(context: FileMocker, func: () => void) {
  return using(context, func, () => context.cleanup());
}
