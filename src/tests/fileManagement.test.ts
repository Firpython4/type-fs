import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import {
  toPath,
  getFileRelative,
  sizeOfAsync,
  relativePath,
} from "~/fileManagement";
import { createFileMocker } from "~/tests/shared/mocking/fileMocking";
import * as fsSync from "node:fs";
import path from "node:path";

describe("getFileRelative", () => {
  let fileMocker: ReturnType<typeof createFileMocker>;

  beforeEach(() => {
    fileMocker = createFileMocker(
      toPath("test-resources/fileManagement/getFileRelative"),
    );
  });

  afterEach(() => {
    fileMocker.cleanup();
  });

  test("should read file relative to cwd", async () => {
    const testPath = "test-resources/fileManagement/getFileRelative/test.txt";
    fsSync.writeFileSync(path.join(process.cwd(), testPath), "Hello World");

    const result = await getFileRelative(testPath);
    expect(result.toString()).toBe("Hello World");

    fsSync.unlinkSync(path.join(process.cwd(), testPath));
  });

  test("should throw error when file does not exist", async () => {
    await expect(
      getFileRelative("nonexistent-file-that-does-not-exist.xyz"),
    ).rejects.toThrow();
  });
});

describe("sizeOfAsync", () => {
  let fileMocker: ReturnType<typeof createFileMocker>;

  beforeEach(() => {
    fileMocker = createFileMocker(
      toPath("test-resources/fileManagement/sizeOfAsync"),
    );
  });

  afterEach(() => {
    fileMocker.cleanup();
  });

  test.skip("should return error when file cannot be opened", async () => {
    const result = await sizeOfAsync("test.png");
    if (result.wasResultSuccessful) {
      throw new Error("Expected error");
    }
  });
});

describe("relativePath", () => {
  let fileMocker: ReturnType<typeof createFileMocker>;

  beforeEach(() => {
    fileMocker = createFileMocker(
      toPath("test-resources/fileManagement/relativePath"),
    );
  });

  afterEach(() => {
    fileMocker.cleanup();
  });

  test("should join relative path with cwd", () => {
    const result = relativePath(toPath("test.txt"));
    const cwd = process.cwd();
    expect(result).toBe(path.join(cwd, "test.txt"));
  });
});
