import { createFileMocker } from "~/tests/shared/mocking/fileMocking";
import { toPath } from "~/fileManagement";
import { usingFileMockerAsync } from "~/tests/shared/mocking/useFileMocker";
import { expect, test } from "vitest";
import {typefs} from "~/schemas";
import { couldNotReadDirectory } from "~/types";

test("The union schema should parse a union", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/union/unionTest"))
    .createFile(toPath("a.url"), "https://www.google.com")
    .createFile(toPath("b.md"), "# Hello World")
    .copyFile(toPath("test-resources/gratisography-cool-cat.jpg"), toPath("c.jpg"));

  await usingFileMockerAsync(fileMocker, async () => {
    const unionSchema = typefs.union(
      typefs.url(),
      typefs.markdown(),
      typefs.image("test-resources")
    );

    const firstResult = await unionSchema.parse(toPath("test-resources/union/unionTest/a.url"));
    expect(firstResult.wasResultSuccessful).toBeTruthy();
    if (!firstResult.wasResultSuccessful) {
      throw new Error(firstResult.errorValue);
    }

    expect(firstResult.okValue.option).toBe(0);
    if (firstResult.okValue.option !== 0) {
      throw new Error("Invalid option");
    }

    expect(firstResult.okValue.value.url).toBe("https://www.google.com");

    const secondResult = await unionSchema.parse(toPath("test-resources/union/unionTest/b.md"));
    expect(secondResult.wasResultSuccessful).toBeTruthy();
    if (!secondResult.wasResultSuccessful) {
      throw new Error(secondResult.errorValue);
    }
    expect(secondResult.okValue.option).toBe(1);
    if (secondResult.okValue.option !== 1) {
      throw new Error("Invalid option");
    }

    expect(secondResult.okValue.value.name).toBe("b");
    expect(secondResult.okValue.value.path).toBe("test-resources/union/unionTest/b.md");

    const thirdResult = await unionSchema.parse(toPath("test-resources/union/unionTest/c.jpg"));
    expect(thirdResult.wasResultSuccessful).toBeTruthy();
    if (!thirdResult.wasResultSuccessful) {
      throw new Error(thirdResult.errorValue);
    }

    expect(thirdResult.okValue.option).toBe(2);
    if (thirdResult.okValue.option !== 2) {
      throw new Error("Invalid option");
    }

    expect(thirdResult.okValue.value.name).toBe("c");
    expect(thirdResult.okValue.value.url).toBe("/union/unionTest/c.jpg");
  });
});

test("The union schema should fail if the file does not exist", async () => {
  const unionSchema = typefs.union(
    typefs.url(),
    typefs.markdown(),
    typefs.image("test-resources")
  );

  const result = await unionSchema.parse(toPath("test-resources/union/doesNotExist"));
  if (result.wasResultSuccessful) {
    throw new Error("Expected error");
  }

  expect(result.errorValue).toBe("file does not exist");
});

test("The union schema should fail if the file is not any of the variants", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/union/unionTest"))
    .createFile(toPath("notAUnion.txt"), "Hello World");

  await usingFileMockerAsync(fileMocker, async () => {
    const unionSchema = typefs.union(
      typefs.url(),
      typefs.markdown(),
      typefs.image("test-resources")
    );

    const result = await unionSchema.parse(fileMocker.getCurrentFile());
    if (result.wasResultSuccessful) {
      throw new Error("Expected error");
    }

    expect(result.errorValue).toBe("no matches");
  });
});