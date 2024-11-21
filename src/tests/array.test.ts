import { expect, test } from "vitest";
import { relativePath, toPath } from "~/fileManagement";
import typefs from "~/typefs";
import { createFileMocker } from "~/tests/mocking/fileMocking";
import { usingFileMockerAsync } from "~/tests/usingMockingContext";

test("The array schema should parse an array of urls", async () => {
  const fileMocker = createFileMocker(relativePath(toPath("test-resources/array/arrayTest")))
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
  })})

test("The array schema should parse an array of objects", async () => {
  const fileMocker = createFileMocker(relativePath(toPath("test-resources/array/arrayTest")))
    .createDirectory(toPath("object"))
    .createFile(toPath("a.url"), "https://www.google.com")
    .goBack()
    .createDirectory(toPath("object2"))
    .createFile(toPath("b.url"), "https://youtube.com")

  await usingFileMockerAsync(fileMocker, async () => {
    const arrayResult = await typefs.array(typefs.object({
      url: typefs.url(),
    })).parse(fileMocker.getCurrentDirectory())
    expect(arrayResult.wasResultSuccessful).toBeTruthy();
  })}
)