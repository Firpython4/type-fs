import { safeJoin, toPath } from "~/fileManagement";
import { createFileMocker } from "~/tests/shared/mocking/fileMocking";
import { usingFileMockerAsync } from "~/tests/shared/mocking/useFileMocker";
import { expect, test } from "vitest";
import {typefs} from "~/schemas";

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