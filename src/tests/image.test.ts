import { createFileMocker } from "~/tests/shared/mocking/fileMocking";
import { toPath } from "~/fileManagement";
import { expect, test, vitest } from "vitest";
import { usingFileMockerAsync } from "~/tests/shared/mocking/useFileMocker";
import {typefs} from "~/schemas";

test("The image schema should parse an image", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/image/imageTest1"))
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
  const fileMocker = createFileMocker(toPath("test-resources/image/imageTest2"))
    .createFile(toPath("notAnImage.txt"), "Hello World");

  await usingFileMockerAsync(fileMocker, async () => {
    const imageResult = await typefs.image().parse(fileMocker.getCurrentFile());
    if (imageResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }

    expect(imageResult.errorValue).toBe("invalid extension");
  });
});

test("A image schema with a name should parse a image file with the given name", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/image/imageTest3"))
    .copyFile(toPath("test-resources/gratisography-cool-cat.jpg"), toPath("gratisography-cool-cat.jpg"));

  await usingFileMockerAsync(fileMocker, async () => {
    const imageResult = await typefs.image().withName("gratisography-cool-cat").parse(fileMocker.getCurrentFile());
    expect(imageResult.wasResultSuccessful).toBeTruthy();
    if (!imageResult.wasResultSuccessful) {
      throw new Error(imageResult.errorValue);
    }
    expect(imageResult.okValue.name).toBe("gratisography-cool-cat");
  });
});

test("A image schema with a name should fail if the file does not match the name", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/image/imageTest4"))
    .copyFile(toPath("test-resources/gratisography-cool-cat.jpg"), toPath("gratisography-cool-cat.jpg"));

  await usingFileMockerAsync(fileMocker, async () => {
    const imageResult = await typefs.image().withName("wrong-name").parse(fileMocker.getCurrentFile());
    if (imageResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }
    expect(imageResult.errorValue).toBe("name does not match");
  });
});

test("A image schema with an error handler should parse a image file with the given name", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/image/imageTest5"))
    .copyFile(toPath("test-resources/gratisography-cool-cat.jpg"), toPath("gratisography-cool-cat.jpg"));


  await usingFileMockerAsync(fileMocker, async () => {
    const spy = vitest.fn();
    const imageResult = await typefs.image()
      .withErrorHandler(spy)
      .withName("gratisography-cool-cat")
      .parse(fileMocker.getCurrentFile());
    expect(imageResult.wasResultSuccessful).toBeTruthy();
    if (!imageResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }
    expect(imageResult.okValue.name).toBe("gratisography-cool-cat");
    expect(spy).not.toHaveBeenCalled();
  });
});

test("A image schema with an error handler should fail and call the error handler if the file does not exist", async () => {
  const spy = vitest.fn();
  const imageResult = await typefs.image()
    .withName("gratisography-cool-cat")
    .withErrorHandler(spy)
    .parse(toPath("test-resources/image/doesNotExist/test.jpg"));

  if (imageResult.wasResultSuccessful) {
    throw new Error("Expected error");
  }

  expect(spy).toHaveBeenCalled();
});