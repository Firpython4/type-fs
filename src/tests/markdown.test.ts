import { createFileMocker } from "~/tests/shared/mocking/fileMocking";
import { readFileSafe, toPath } from "~/fileManagement";
import { usingFileMockerAsync } from "~/tests/shared/mocking/useFileMocker";
import { expect, test, vitest } from "vitest";
import { z } from "zod";
import {typefs} from "~/schemas";

test("The markdown schema should parse a markdown file", async () => {
  const inPath = toPath("test-resources/markdown/markdownTest");
  const fileMocker = createFileMocker(inPath)
    .createFile(toPath("test.md"), "# Hello World");

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs.markdown().parse(fileMocker.getCurrentFile());
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

test("The markdown schema should parse a markdown file with matter", async () => {
  const inPath = toPath("test-resources/markdown/markdownTest");
  const fileMocker = createFileMocker(inPath)
    .copyFile(toPath("test-resources/markdownWithMatter.md"), toPath("test.md"));

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs.markdown()
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

test("The markdown schema should fail if the file does not exist", async () => {
  const markdownResult = await typefs.markdown().parse(toPath("test-resources/markdown/doesNotExist/test.md"));
  if (markdownResult.wasResultSuccessful) {
    throw new Error("Expected error");
  }

  expect(markdownResult.errorValue).toBe("could not read file");
});

test("The markdown schema should fail if the file is not a markdown file", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/markdown/markdownTest"))
    .createFile(toPath("notAMarkdown.txt"), "Hello World");

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs.markdown().parse(fileMocker.getCurrentFile());
    if (markdownResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }

    expect(markdownResult.errorValue).toBe("invalid extension");
  });
});

test("A markdown schema with a name should parse a markdown file with the given name", async () => {
  const inPath = toPath("test-resources/markdown/markdownTest");
  const fileMocker = createFileMocker(inPath)
    .createFile(toPath("test.md"), "# Hello World");

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs.markdown().withName("test").parse(fileMocker.getCurrentFile());
    expect(markdownResult.wasResultSuccessful).toBeTruthy();
    if (!markdownResult.wasResultSuccessful) {
      throw new Error(markdownResult.errorValue);
    }
    expect(markdownResult.okValue.name).toBe("test");
  });
});

test("A markdown schema with a name should fail if the file does not match the name", async () => {
  const inPath = toPath("test-resources/markdown/markdownTest");
  const fileMocker = createFileMocker(inPath)
    .createFile(toPath("test.md"), "# Hello World");

  await usingFileMockerAsync(fileMocker, async () => {
    const markdownResult = await typefs.markdown().withName("notTest").parse(fileMocker.getCurrentFile());
    if (markdownResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }

    expect(markdownResult.errorValue).toBe("name does not match");
  });
});

test("A markdown schema with an error handler should parse a markdown file with the given name", async () => {
  const inPath = toPath("test-resources/markdown/markdownTest2");
  const fileMocker = createFileMocker(inPath)
    .createFile(toPath("test.md"), "# Hello World");

  await usingFileMockerAsync(fileMocker, async () => {
    const spy = vitest.fn();
    const markdownResult = await typefs.markdown()
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

test("A markdown schema with an error handler should fail and call the error handler if the file does not exist", async () => {
  const spy = vitest.fn();

  const markdownResult = await typefs.markdown()
    .withName("test")
    .withErrorHandler(spy)
    .parse(toPath("test-resources/markdown/doesNotExist/test.md"));

  if (markdownResult.wasResultSuccessful) {
    throw new Error("Expected error");
  }

  expect(spy).toHaveBeenCalled();
});
