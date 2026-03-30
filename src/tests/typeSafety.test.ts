import { expect, test, describe } from "vitest";
import { includesInner } from "~/typeSafety";

describe("includesInner", () => {
  test("should return true when search string is in the middle", () => {
    const result = includesInner("hello world foo", "world");
    expect(result).toBe(true);
  });

  test("should return false when string equals search string exactly", () => {
    const result = includesInner("world", "world");
    expect(result).toBe(false);
  });

  test("should return false when string starts with search string", () => {
    const result = includesInner("worldfoo", "world");
    expect(result).toBe(false);
  });

  test("should return false when string ends with search string", () => {
    const result = includesInner("helloworld", "world");
    expect(result).toBe(false);
  });

  test("should return false when search string is not found", () => {
    const result = includesInner("hello world", "foo");
    expect(result).toBe(false);
  });

  test("should return true when search is surrounded by different content", () => {
    const result = includesInner("abczb", "z");
    expect(result).toBe(true);
  });

  test("should return false for single char at start", () => {
    const result = includesInner("ab", "a");
    expect(result).toBe(false);
  });
});
