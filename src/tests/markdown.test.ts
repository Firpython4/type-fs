﻿import { createFileMocker } from "~/tests/shared/mocking/fileMocking";
import { readFileSafe, toPath } from "~/fileManagement";
import { usingFileMockerAsync } from "~/tests/shared/mocking/useFileMocker";
import typefs from "~/typefs";
import { expect, test } from "vitest";
import { z } from "zod";

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