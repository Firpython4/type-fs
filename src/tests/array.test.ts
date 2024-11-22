import { expect, test } from "vitest";
import { createFileMocker } from "~/tests/shared/mocking/fileMocking";
import { usingFileMockerAsync } from "~/tests/shared/mocking/useFileMocker";
import {toPath} from "~/fileManagement";
import {typefs} from "~/schemas";
import { couldNotReadDirectory } from "~/types";

test("arrayTest1: The array schema should parse an array of urls", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/array/arrayTest1"))
    .createFile(toPath("a.url"), "https://www.google.com")
    .createFile(toPath("b.url"), "https://youtube.com");

  await usingFileMockerAsync(fileMocker, async () => {
    const arrayResult = await typefs.array(typefs.url()).parse(fileMocker.getCurrentDirectory());
    expect(arrayResult.wasResultSuccessful).toBeTruthy();
    if (!arrayResult.wasResultSuccessful) {
      throw new Error(arrayResult.errorValue);
    }
    expect(arrayResult.okValue.length).toBe(2);
    expect(arrayResult.okValue[0]!.url).toBe("https://www.google.com");
    expect(arrayResult.okValue[1]!.url).toBe("https://youtube.com");
  });
});

test("arrayTest2: The array schema should parse an array of objects", async () => {
    const fileMocker = createFileMocker(toPath("test-resources/array/arrayTest2"))
      .createDirectory(toPath("object"))
      .createFile(toPath("a.url"), "https://www.google.com")
      .goBack()
      .createDirectory(toPath("object2"))
      .createFile(toPath("b.url"), "https://youtube.com");

    await usingFileMockerAsync(fileMocker, async () => {
      const arrayResult = await typefs.array(typefs.object({
        url: typefs.url()
      })).parse(fileMocker.getCurrentDirectory());
      expect(arrayResult.wasResultSuccessful).toBeTruthy();
    });
  }
);

test("arrayTest3: The array schema parsing should fail if the directory does not exist", async () => {
  const arrayResult = await typefs.array(typefs.url()).parse(toPath("test-resources/array/doesNotExist"));
  if (arrayResult.wasResultSuccessful) {
    throw new Error("Expected error");
  }

  expect(arrayResult.errorValue).toBe(couldNotReadDirectory);
});

test("arrayTest4: An array schema with a name should parse an array of urls", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/array/arrayTest4"))
    .createFile(toPath("a.url"), "https://www.google.com")
    .createFile(toPath("b.url"), "https://youtube.com");

  await usingFileMockerAsync(fileMocker, async () => {
    const arrayResult = await typefs.array(typefs.url()).withName("arrayTest4").parse(fileMocker.getCurrentDirectory());
    expect(arrayResult.wasResultSuccessful).toBeTruthy();
    if (!arrayResult.wasResultSuccessful) {
      throw new Error(arrayResult.errorValue);
    }
    expect(arrayResult.okValue.parsed.length).toBe(2);
    expect(arrayResult.okValue.parsed[0]!.url).toBe("https://www.google.com");
    expect(arrayResult.okValue.parsed[1]!.url).toBe("https://youtube.com");
  });
});

test("arrayTest5: An array schema with a name should fail if the file does not match the name pattern", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/array/arrayTest5"))
    .createFile(toPath("a.url"), "https://www.google.com")
    .createFile(toPath("b.url"), "https://youtube.com");

  await usingFileMockerAsync(fileMocker, async () => {
    const arrayResult = await typefs.array(typefs.url()).withName("wrong-name").parse(fileMocker.getCurrentDirectory());
    if (arrayResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }
    expect(arrayResult.errorValue).toBe("name does not match");
  });
});