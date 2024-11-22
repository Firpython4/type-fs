import { safeJoin, toPath } from "~/fileManagement";
import { createFileMocker } from "~/tests/shared/mocking/fileMocking";
import { usingFileMockerAsync } from "~/tests/shared/mocking/useFileMocker";
import { expect, test } from "vitest";
import {typefs} from "~/schemas";
import { couldNotReadDirectory } from "~/types";

test("The object schema should parse an object", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/object/objectTest"))
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
    expect(objectResult.okValue.image.url).toBe("/object/objectTest/c.jpg");
  });
});

test("The object schema should fail if the directory does not exist", async () => {
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

test("The object schema should fail if the directory is not a directory", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/object/objectTest"))
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

test("The object schema should fail if the directory does not contain all the required files", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/object/objectTest"))
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

test("Optional fields should be correctly parsed", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/object/objectTest"))
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
    expect(objectResult.okValue.image!.url).toBe("/object/objectTest/c.jpg");
  });
});

test("Optional fields should be correctly parsed with a name", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/object/objectTest"))
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
    expect(objectResult.okValue.image!.parsed.url).toBe("/object/objectTest/c.jpg");
  });
});

test("Optional fields should not cause an error if the file does not exist", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/object/objectTestOptional"))
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
