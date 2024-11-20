// sum.test.js
import { expect, test } from 'vitest'
import { relativePath, safePath } from "~/fileManagement";
import typefs from "~/typefs";

test("The array schema should parse an array of urls", async () => {
  const path = relativePath(safePath("test-resources/array/arrayTest"));
  console.log(path);
  const arrayResult = await typefs.array(typefs.url()).parse(path);
  expect(arrayResult.wasResultSuccessful).toBeTruthy();
  if (!arrayResult.wasResultSuccessful) {
    throw new Error(arrayResult.errorValue);
  }
  expect(arrayResult.okValue.length).toBe(2);
  expect(arrayResult.okValue[0]!.url).toBe("https://www.google.com");
  expect(arrayResult.okValue[1]!.url).toBe("https://youtube.com");
})