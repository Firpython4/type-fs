import { createFileMocker } from "~/tests/shared/mocking/fileMocking";
import { toPath } from "~/fileManagement";
import { expect, test } from "vitest";
import { usingFileMockerAsync } from "~/tests/shared/mocking/useFileMocker";
import {typefs} from "~/schemas";

test("The image schema should parse an image", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/image/imageTest"))
    .copyFile(toPath("test-resources/gratisography-cool-cat.jpg"), toPath("gratisography-cool-cat.jpg"));

  await usingFileMockerAsync(fileMocker, async () => {
    const imageResult = await typefs.image().parse(fileMocker.getCurrentFile());
    expect(imageResult.wasResultSuccessful).toBeTruthy();
    if (!imageResult.wasResultSuccessful) {
      throw new Error(imageResult.errorValue);
    }

    expect(imageResult.okValue.type).toBe("image");
    expect(imageResult.okValue.name).toBe("gratisography-cool-cat");
    expect(imageResult.okValue.width).toBe(3000);
    expect(imageResult.okValue.height).toBe(2000);
  });
});

test("The image schema should fail if the file does not exist", async () => {
  const imageResult = await typefs.image().parse(toPath("test-resources/image/doesNotExist/imageTest.jpg"));
  if (imageResult.wasResultSuccessful) {
    throw new Error("Expected error");
  }

  expect(imageResult.errorValue).toBe("could not read file");
});

test("The image schema should fail if the file is not an image", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/image/imageTest"))
    .createFile(toPath("notAnImage.txt"), "Hello World");

  await usingFileMockerAsync(fileMocker, async () => {
    const imageResult = await typefs.image().parse(fileMocker.getCurrentFile());
    if (imageResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }

    expect(imageResult.errorValue).toBe("invalid extension");
  });
});
