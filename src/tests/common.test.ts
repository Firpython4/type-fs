import { expect, test, describe, vitest } from "vitest";
import { getName, __testExports__ } from "~/schemas/common";
import { toPath } from "~/fileManagement";
import { typefs } from "~/schemas";
import { z } from "zod";

const { errorHandler, withNameHandler, optionalWrapper } = __testExports__;

describe("getName", () => {
  test("should extract name from path without extension", () => {
    const result = getName(toPath("path/to/file.txt"));
    expect(result).toBe("file");
  });

  test("should handle path without extension", () => {
    const result = getName(toPath("path/to/filename"));
    expect(result).toBe("filename");
  });

  test("should handle multiple dots in filename", () => {
    const result = getName(toPath("path/to/file.name.txt"));
    expect(result).toBe("file.name");
  });

  test("should handle empty path", () => {
    const result = getName(toPath(""));
    expect(result).toBe("");
  });
});

describe("errorHandler", () => {
  test("should call handler on parse error", async () => {
    const handler = vitest.fn();
    const failingParser: any = {
      parse: async () => ({
        wasResultSuccessful: false,
        errorValue: "test error",
      }),
      withErrorHandler: () => failingParser,
      withName: () => failingParser,
      optional: () => failingParser,
      isOptional: false,
    };

    const wrapped = errorHandler(failingParser, handler);
    const result = await wrapped.parse(toPath("test.txt"));

    expect(result.wasResultSuccessful).toBe(false);
    expect(handler).toHaveBeenCalledWith("test error", toPath("test.txt"));
  });

  test("should not call handler on success", async () => {
    const handler = vitest.fn();
    const successParser: any = {
      parse: async () => ({ wasResultSuccessful: true, okValue: "ok" }),
      withErrorHandler: () => successParser,
      withName: () => successParser,
      optional: () => successParser,
      isOptional: false,
    };

    const wrapped = errorHandler(successParser, handler);
    const result = await wrapped.parse(toPath("test.txt"));

    expect(result.wasResultSuccessful).toBe(true);
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("optionalWrapper", () => {
  test("should set isOptional to true", () => {
    const schema: any = {
      parse: async () => ({ wasResultSuccessful: true, okValue: "ok" }),
      withErrorHandler: () => schema,
      withName: () => schema,
      optional: () => schema,
      isOptional: false,
    };

    const wrapped = optionalWrapper(schema);
    expect(wrapped.isOptional).toBe(true);
  });

  test("should allow chaining withName after optional", async () => {
    const schema: any = {
      parse: async () => ({ wasResultSuccessful: true, okValue: "content" }),
      withErrorHandler: () => schema,
      withName: () => schema,
      optional: () => schema,
      isOptional: false,
    };

    const wrapped = optionalWrapper(schema);
    const withName = wrapped.withName("test");
    const result = await withName.parse(toPath("test.txt"));

    expect(result.wasResultSuccessful).toBe(true);
    if (result.wasResultSuccessful) {
      expect(result.okValue.name).toBe("test");
    }
  });

  test.skip("should allow chaining errorHandler after optional", async () => {
    const handler = vitest.fn();
    const schema: any = {
      parse: async () => ({ wasResultSuccessful: false, errorValue: "fail" }),
      withErrorHandler: (h: any) => {
        handler(h);
        return schema;
      },
      withName: () => schema,
      optional: () => schema,
      isOptional: false,
    };

    const wrapped = optionalWrapper(schema);
    const withError = wrapped.withErrorHandler(handler);
    const result = await withError.parse(toPath("test.txt"));

    expect(result.wasResultSuccessful).toBe(false);
    expect(handler).toHaveBeenCalled();
  });
});

describe("withNameHandler", () => {
  test("should add name to parsed result", async () => {
    const baseSchema: any = {
      parse: async () => ({ wasResultSuccessful: true, okValue: "content" }),
      withErrorHandler: () => baseSchema,
      withName: () => baseSchema,
      optional: () => baseSchema,
      isOptional: false,
    };

    const named = withNameHandler(baseSchema, "test");
    const result = await named.parse(toPath("test.txt"));

    expect(result.wasResultSuccessful).toBe(true);
    if (result.wasResultSuccessful) {
      expect(result.okValue.name).toBe("test");
    }
  });

  test("should return error when name doesn't match pattern", async () => {
    const baseSchema: any = {
      parse: async () => ({ wasResultSuccessful: true, okValue: "content" }),
      withErrorHandler: () => baseSchema,
      withName: () => baseSchema,
      optional: () => baseSchema,
      isOptional: false,
    };

    const named = withNameHandler(baseSchema, "wrong");
    const result = await named.parse(toPath("test.txt"));

    expect(result.wasResultSuccessful).toBe(false);
  });

  test("should allow chaining withName multiple times", async () => {
    const baseSchema: any = {
      parse: async () => ({ wasResultSuccessful: true, okValue: "content" }),
      withErrorHandler: () => baseSchema,
      withName: () => baseSchema,
      optional: () => baseSchema,
      isOptional: false,
    };

    const named = withNameHandler(baseSchema);
    const named2 = named.withName("test");
    const result = await named2.parse(toPath("test.txt"));

    expect(result.wasResultSuccessful).toBe(true);
    if (result.wasResultSuccessful) {
      expect(result.okValue.name).toBe("test");
    }
  });
});
