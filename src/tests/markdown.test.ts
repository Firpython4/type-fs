import { createFileMocker } from "~/tests/shared/mocking/fileMocking";
import { readFileSafe, toPath } from "~/fileManagement";
import { usingFileMockerAsync } from "~/tests/shared/mocking/useFileMocker";
import { expect, test, vitest } from "vitest";
import { z } from "zod";
import { typefs } from "~/schemas";

test("markdownTest1: The markdown schema should parse a markdown file", async () => {
  const inPath = toPath("test-resources/markdown/markdownTest1");
  const fileMocker = createFileMocker(inPath).createFile(
    toPath("test.md"),
    "# Hello World",
  );

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs
      .markdown()
      .parse(fileMocker.getCurrentFile());
    expect(markdownResult.wasResultSuccessful).toBeTruthy();
    if (!markdownResult.wasResultSuccessful) {
      throw new Error(markdownResult.errorValue);
    }

    expect(markdownResult.okValue.name).toBe("test");
    expect(markdownResult.okValue.path).toBe(fileMocker.getCurrentFile());
    const result = await readFileSafe(markdownResult.okValue.path);
    if (!result.wasResultSuccessful) {
      throw new Error(result.errorValue);
    }
    expect(result.okValue.toString()).toBe("# Hello World");
  });
});

test("markdownTest2: The markdown schema should parse a markdown file with matter", async () => {
  const inPath = toPath("test-resources/markdown/markdownTest2");
  const fileMocker = createFileMocker(inPath).copyFile(
    toPath("test-resources/markdownWithMatter.md"),
    toPath("test.md"),
  );

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs
      .markdown()
      .withMatter(z.object({ title: z.string() }))
      .parse(fileMocker.getCurrentFile());
    expect(markdownResult.wasResultSuccessful).toBeTruthy();
    if (!markdownResult.wasResultSuccessful) {
      throw new Error(markdownResult.errorValue);
    }

    expect(markdownResult.okValue.html).toBe("<h1>Hello World</h1>\n");
    expect(markdownResult.okValue.asString).toBe("Hello World\n");
    expect(markdownResult.okValue.matters.title).toBe("This is a title");
  });
});

test("markdownTest3: The markdown schema should fail if the file does not exist", async () => {
  const markdownResult = await typefs
    .markdown()
    .parse(toPath("test-resources/markdown/doesNotExist/test.md"));
  if (markdownResult.wasResultSuccessful) {
    throw new Error("Expected error");
  }

  expect(markdownResult.errorValue).toBe("could not read file");
});

test("markdownTest4: The markdown schema should fail if the file is not a markdown file", async () => {
  const fileMocker = createFileMocker(
    toPath("test-resources/markdown/markdownTest4"),
  ).createFile(toPath("notAMarkdown.txt"), "Hello World");

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs
      .markdown()
      .parse(fileMocker.getCurrentFile());
    if (markdownResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }

    expect(markdownResult.errorValue).toBe("invalid extension");
  });
});

test("markdownTest5: A markdown schema with a name should parse a markdown file with the given name", async () => {
  const inPath = toPath("test-resources/markdown/markdownTest5");
  const fileMocker = createFileMocker(inPath).createFile(
    toPath("test.md"),
    "# Hello World",
  );

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs
      .markdown()
      .withName("test")
      .parse(fileMocker.getCurrentFile());
    expect(markdownResult.wasResultSuccessful).toBeTruthy();
    if (!markdownResult.wasResultSuccessful) {
      throw new Error(markdownResult.errorValue);
    }
    expect(markdownResult.okValue.name).toBe("test");
  });
});

test("markdownTest6: A markdown schema with a name should fail if the file does not match the name pattern", async () => {
  const inPath = toPath("test-resources/markdown/markdownTest6");
  const fileMocker = createFileMocker(inPath).createFile(
    toPath("test.md"),
    "# Hello World",
  );

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs
      .markdown()
      .withName("notTest")
      .parse(fileMocker.getCurrentFile());
    if (markdownResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }

    expect(markdownResult.errorValue).toBe("name does not match");
  });
});

test("markdownTest7: A markdown schema with an error handler should parse a markdown file with the given name", async () => {
  const inPath = toPath("test-resources/markdown/markdownTest7");
  const fileMocker = createFileMocker(inPath).createFile(
    toPath("test.md"),
    "# Hello World",
  );

  await usingFileMockerAsync(fileMocker, async () => {
    const spy = vitest.fn();
    const markdownResult = await typefs
      .markdown()
      .withErrorHandler(spy)
      .withName("test")
      .parse(fileMocker.getCurrentFile());

    expect(markdownResult.wasResultSuccessful).toBeTruthy();

    if (!markdownResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }

    expect(markdownResult.okValue.name).toBe("test");
    expect(spy).not.toHaveBeenCalled();
  });
});

test("markdownTest8: A markdown schema with an error handler should fail and call the error handler if the file does not exist", async () => {
  const spy = vitest.fn();

  const markdownResult = await typefs
    .markdown()
    .withName("test")
    .withErrorHandler(spy)
    .parse(toPath("test-resources/markdown/doesNotExist/test.md"));

  if (markdownResult.wasResultSuccessful) {
    throw new Error("Expected error");
  }

  expect(spy).toHaveBeenCalled();
});

test("markdownTest9: Markdown with matter should fail if file does not exist", async () => {
  const markdownResult = await typefs
    .markdown()
    .withMatter(z.object({ title: z.string() }))
    .parse(toPath("test-resources/markdown/doesNotExist/test.md"));

  if (markdownResult.wasResultSuccessful) {
    throw new Error("Expected error");
  }

  expect(markdownResult.errorValue).toBe("could not read file");
});

test("markdownTest10: Markdown with matter should handle non-string matter values", async () => {
  const fileMocker = createFileMocker(
    toPath("test-resources/markdown/markdownTest10"),
  ).createFile(
    toPath("test.md"),
    "---\ntitle: Hello\ncount: 5\n---\n# Content",
  );

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs
      .markdown()
      .withMatter(z.object({ title: z.string(), count: z.number() }))
      .parse(fileMocker.getCurrentFile());

    expect(markdownResult.wasResultSuccessful).toBeTruthy();
    if (!markdownResult.wasResultSuccessful) {
      throw new Error(markdownResult.errorValue);
    }
    expect(markdownResult.okValue.matters.title).toBe("Hello");
    expect(markdownResult.okValue.matters.count).toBe(5);
  });
});

test("markdownTest11: Markdown with matter should handle numeric values in schema", async () => {
  const fileMocker = createFileMocker(
    toPath("test-resources/markdown/markdownTest11"),
  ).createFile(toPath("test.md"), "---\ncount: 42\n---\n# Content");

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs
      .markdown()
      .withMatter(z.object({ count: z.number() }))
      .parse(fileMocker.getCurrentFile());

    expect(markdownResult.wasResultSuccessful).toBeTruthy();
    if (!markdownResult.wasResultSuccessful) {
      throw new Error(markdownResult.errorValue);
    }
    expect(markdownResult.okValue.matters.count).toBe(42);
  });
});

test("markdownTest12: Markdown with matter should fail for non-markdown extension", async () => {
  const fileMocker = createFileMocker(
    toPath("test-resources/markdown/markdownTest12"),
  ).createFile(toPath("test.txt"), "Some content");

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs
      .markdown()
      .withMatter(z.object({ title: z.string() }))
      .parse(fileMocker.getCurrentFile());

    if (markdownResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }
    expect(markdownResult.errorValue).toBe("no matches");
  });
});

test("markdownTest13: Markdown with optional should parse", async () => {
  const inPath = toPath("test-resources/markdown/markdownTest13");
  const fileMocker = createFileMocker(inPath).createFile(
    toPath("test.md"),
    "# Hello World",
  );

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs
      .markdown()
      .optional()
      .parse(fileMocker.getCurrentFile());

    expect(markdownResult.wasResultSuccessful).toBeTruthy();
    if (!markdownResult.wasResultSuccessful) {
      throw new Error(String(markdownResult.errorValue));
    }
    expect(markdownResult.okValue.name).toBe("test");
  });
});

test("markdownTest14: Markdown with matter and optional should parse", async () => {
  const inPath = toPath("test-resources/markdown/markdownTest14");
  const fileMocker = createFileMocker(inPath).createFile(
    toPath("test.md"),
    "---\ntitle: Hello\n---\n# Content",
  );

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs
      .markdown()
      .withMatter(z.object({ title: z.string() }))
      .optional()
      .parse(fileMocker.getCurrentFile());

    expect(markdownResult.wasResultSuccessful).toBeTruthy();
    if (!markdownResult.wasResultSuccessful) {
      throw new Error(String(markdownResult.errorValue));
    }
    expect(markdownResult.okValue.matters.title).toBe("Hello");
  });
});

test("markdownTest15: Markdown with matter and error handler should call handler on error", async () => {
  const spy = vitest.fn();
  const markdownResult = await typefs
    .markdown()
    .withMatter(z.object({ title: z.string() }))
    .withErrorHandler(spy)
    .parse(toPath("test-resources/markdown/doesNotExist/test.md"));

  if (markdownResult.wasResultSuccessful) {
    throw new Error("Expected error");
  }
  expect(spy).toHaveBeenCalled();
});

test("markdownTest16: Markdown with matter should handle newline replacement", async () => {
  const inPath = toPath("test-resources/markdown/markdownTest16");
  const fileMocker = createFileMocker(inPath).createFile(
    toPath("test.md"),
    "---\ntitle: Line1\\nLine2\n---\n# Content",
  );

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs
      .markdown()
      .withMatter(z.object({ title: z.string() }))
      .parse(fileMocker.getCurrentFile());

    expect(markdownResult.wasResultSuccessful).toBeTruthy();
    if (!markdownResult.wasResultSuccessful) {
      throw new Error(String(markdownResult.errorValue));
    }
    expect(markdownResult.okValue.matters.title).toBe("Line1\nLine2");
  });
});

test("markdownTest16: Markdown with matter should handle newline replacement", async () => {
  const inPath = toPath("test-resources/markdown/markdownTest16");
  const fileMocker = createFileMocker(inPath).createFile(
    toPath("test.md"),
    "---\ntitle: Line1\\nLine2\n---\n# Content",
  );

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs
      .markdown()
      .withMatter(z.object({ title: z.string() }))
      .parse(fileMocker.getCurrentFile());

    expect(markdownResult.wasResultSuccessful).toBeTruthy();
    if (!markdownResult.wasResultSuccessful) {
      throw new Error(String(markdownResult.errorValue));
    }
    expect(markdownResult.okValue.matters.title).toBe("Line1\nLine2");
  });
});

test.skip("markdownTest17: Markdown with matter should fail when safeParse returns false", async () => {
  const inPath = toPath("test-resources/markdown/markdownTest17");
  const fileMocker = createFileMocker(inPath).createFile(
    toPath("test.md"),
    "---invalid yaml---\n# Content",
  );

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs
      .markdown()
      .withMatter(z.object({ title: z.string() }))
      .parse(fileMocker.getCurrentFile());

    if (markdownResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }
    expect(markdownResult.errorValue).toBe("invalid matter");
  });
});
