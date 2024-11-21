export function using<T>(resource: T, func: (resource: T) => void, cleanup: (resource: T) => void) {
  try {
    func(resource);
  } finally {
    cleanup(resource);
  }
}
export async function usingAsync<T>(resource: T, func: (resource: T) => Promise<void>, cleanup: (resource: T) => void) {
  try {
    await func(resource);
  } finally {
    cleanup(resource);
  }
}
