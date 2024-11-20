// sum.test.js
import { expect, test } from "vitest";
import { relativePath, toPath } from "~/fileManagement";
import typefs from "~/typefs";
import { createFileMocker } from "~/tests/fileMocking";
import { usingFileMockerAsync } from "~/tests/usingMockingContext";

test("The array schema should parse an array of urls", async () => {
  const fileMocker = createFileMocker(relativePath(toPath("test-resources/array")))
    .createDirectory(toPath("arrayTest"))
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