import { expect, test } from "vitest";
import { createFileMocker } from "~/tests/shared/mocking/fileMocking";
import { usingFileMockerAsync } from "~/tests/shared/mocking/useFileMocker";
import {toPath} from "~/fileManagement";
import {typefs} from "~/schemas";
import { couldNotReadDirectory } from "~/types";

test("The array schema should parse an array of urls", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/array/arrayTest"))
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

test("The array schema should parse an array of objects", async () => {
    const fileMocker = createFileMocker(toPath("test-resources/array/arrayTest"))
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

test("The array schema parsing should fail if the directory does not exist", async () => {

  const arrayResult = await typefs.array(typefs.url()).parse(toPath("test-resources/array/doesNotExist"));
  if (arrayResult.wasResultSuccessful) {
    throw new Error("Expected error");
  }

  expect(arrayResult.errorValue).toBe(couldNotReadDirectory);
});