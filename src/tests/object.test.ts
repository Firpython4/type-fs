import { safeJoin, toPath } from "~/fileManagement";
import { createFileMocker } from "~/tests/shared/mocking/fileMocking";
import { usingFileMockerAsync } from "~/tests/shared/mocking/useFileMocker";
import { expect, test } from "vitest";
import {typefs} from "~/schemas";
import { couldNotReadDirectory } from "~/types";

test("objectTest1: The object schema should parse an object", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/object/objectTest1"))
    .createFile(toPath("a.url"), "https://www.google.com")
    .createFile(toPath("b.md"), "# Hello World")
    .copyFile(toPath("test-resources/gratisography-cool-cat.jpg"), toPath("c.jpg"));

  await usingFileMockerAsync(fileMocker, async () => {
    const objectResult = await typefs.object({
      url: typefs.url(),
      markdown: typefs.markdown(),
      image: typefs.image("test-resources")
    }).parse(fileMocker.getCurrentDirectory());

    expect(objectResult.wasResultSuccessful).toBeTruthy();
    if (!objectResult.wasResultSuccessful) {
      throw new Error(objectResult.errorValue);
    }

    expect(objectResult.okValue.url.url).toBe("https://www.google.com");
    expect(objectResult.okValue.markdown.name).toBe("b");
    expect(objectResult.okValue.markdown.path).toBe(safeJoin(fileMocker.getCurrentDirectory(), toPath("b.md")));
    expect(objectResult.okValue.image.name).toBe("c");
    expect(objectResult.okValue.image.url).toBe("/object/objectTest1/c.jpg");
  });
});

test("objectTest2: The object schema should fail if the directory does not exist", async () => {
  const objectResult = await typefs.object({
    url: typefs.url(),
    markdown: typefs.markdown(),
    image: typefs.image("test-resources")
  }).parse(toPath("test-resources/object/doesNotExist"));

  if (objectResult.wasResultSuccessful) {
    throw new Error("Expected error");
  }

  expect(objectResult.errorValue).toBe(couldNotReadDirectory);
});

test("objectTest3: The object schema should fail if the directory is not a directory", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/object/objectTest3"))
    .createFile(toPath("notADirectory.txt"), "Hello World");

  await usingFileMockerAsync(fileMocker, async () => {
    const objectResult = await typefs.object({
      url: typefs.url(),
      markdown: typefs.markdown(),
      image: typefs.image("test-resources")
    }).parse(fileMocker.getCurrentFile());
    if (objectResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }

    expect(objectResult.errorValue).toBe("could not read directory");
  });
});

test("objectTest4: The object schema should fail if the directory does not contain all the required files", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/object/objectTest4"))
    .createFile(toPath("a.url"), "https://www.google.com")
    .createFile(toPath("b.md"), "# Hello World");

  await usingFileMockerAsync(fileMocker, async () => {
    const objectResult = await typefs.object({
      url: typefs.url(),
      markdown: typefs.markdown(),
      image: typefs.image("test-resources")
    }).parse(fileMocker.getCurrentDirectory());
    if (objectResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }

    expect(objectResult.errorValue).toBe("no matches");
  });
});

test("objectTest5: Optional fields should be correctly parsed", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/object/objectTest5"))
    .createFile(toPath("a.url"), "https://www.google.com")
    .createFile(toPath("b.md"), "# Hello World")
    .copyFile(toPath("test-resources/gratisography-cool-cat.jpg"), toPath("c.jpg"));

  await usingFileMockerAsync(fileMocker, async () => {
    const objectResult = await typefs.object({
      url: typefs.url(),
      markdown: typefs.markdown(),
      image: typefs.image("test-resources").optional()
    }).parse(fileMocker.getCurrentDirectory());

    expect(objectResult.wasResultSuccessful).toBeTruthy();
    if (!objectResult.wasResultSuccessful) {
      throw new Error(objectResult.errorValue);
    }

    expect(objectResult.okValue.url.url).toBe("https://www.google.com");
    expect(objectResult.okValue.markdown.name).toBe("b");
    expect(objectResult.okValue.markdown.path).toBe(safeJoin(fileMocker.getCurrentDirectory(), toPath("b.md")));
    expect(objectResult.okValue.image!.name).toBe("c");
    expect(objectResult.okValue.image!.url).toBe("/object/objectTest5/c.jpg");
  });
});

test("objectTest6: Optional fields should be correctly parsed with a name", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/object/objectTest6"))
    .createFile(toPath("a.url"), "https://www.google.com")
    .createFile(toPath("b.md"), "# Hello World")
    .copyFile(toPath("test-resources/gratisography-cool-cat.jpg"), toPath("c.jpg"));

  await usingFileMockerAsync(fileMocker, async () => {
    const objectResult = await typefs.object({
      url: typefs.url(),
      markdown: typefs.markdown(),
      image: typefs.image("test-resources").withName("c").optional()
    }).parse(fileMocker.getCurrentDirectory());

    expect(objectResult.wasResultSuccessful).toBeTruthy();
    if (!objectResult.wasResultSuccessful) {
      throw new Error(objectResult.errorValue);
    }

    expect(objectResult.okValue.url.url).toBe("https://www.google.com");
    expect(objectResult.okValue.markdown.name).toBe("b");
    expect(objectResult.okValue.markdown.path).toBe(safeJoin(fileMocker.getCurrentDirectory(), toPath("b.md")));
    expect(objectResult.okValue.image!.name).toBe("c");
    expect(objectResult.okValue.image!.parsed.url).toBe("/object/objectTest6/c.jpg");
  });
});

test("objectTest7: Optional fields should not cause an error if the file does not exist", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/object/objectTest7"))
    .createFile(toPath("a.url"), "https://www.google.com")
    .createFile(toPath("b.md"), "# Hello World");

  await usingFileMockerAsync(fileMocker, async () => {
    const objectResult = await typefs.object({
      url: typefs.url(),
      markdown: typefs.markdown(),
      image: typefs.image("test-resources").optional()
    }).parse(fileMocker.getCurrentDirectory());

    expect(objectResult.wasResultSuccessful).toBeTruthy();
    if (!objectResult.wasResultSuccessful) {
      throw new Error(objectResult.errorValue);
    }

    expect(objectResult.okValue.url.url).toBe("https://www.google.com");
    expect(objectResult.okValue.markdown.name).toBe("b");
    expect(objectResult.okValue.markdown.path).toBe(safeJoin(fileMocker.getCurrentDirectory(), toPath("b.md")));
    expect(objectResult.okValue.image).toBeUndefined();
  });
});
