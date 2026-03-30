import { createFileMocker } from "~/tests/shared/mocking/fileMocking";
import { toPath } from "~/fileManagement";
import { expect, test, vitest, vi } from "vitest";
import { usingFileMockerAsync } from "~/tests/shared/mocking/useFileMocker";
import { typefs } from "~/schemas";
import * as fileManagement from "~/fileManagement";

test("imageTest1: The image schema should parse an image", async () => {
  const fileMocker = createFileMocker(
    toPath("test-resources/image/imageTest1"),
  ).copyFile(
    toPath("test-resources/gratisography-cool-cat.jpg"),
    toPath("gratisography-cool-cat.jpg"),
  );

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

test("imageTest2: The image schema should fail if the file does not exist", async () => {
  const imageResult = await typefs
    .image()
    .parse(toPath("test-resources/image/doesNotExist/imageTest.jpg"));
  if (imageResult.wasResultSuccessful) {
    throw new Error("Expected error");
  }

  expect(imageResult.errorValue).toBe("could not read file");
});

test("imageTest3: The image schema should fail if the file is not an image", async () => {
  const fileMocker = createFileMocker(
    toPath("test-resources/image/imageTest3"),
  ).createFile(toPath("notAnImage.txt"), "Hello World");

  await usingFileMockerAsync(fileMocker, async () => {
    const imageResult = await typefs.image().parse(fileMocker.getCurrentFile());
    if (imageResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }

    expect(imageResult.errorValue).toBe("invalid extension");
  });
});

test("imageTest4: A image schema with a name should parse a image file with the given name", async () => {
  const fileMocker = createFileMocker(
    toPath("test-resources/image/imageTest4"),
  ).copyFile(
    toPath("test-resources/gratisography-cool-cat.jpg"),
    toPath("gratisography-cool-cat.jpg"),
  );

  await usingFileMockerAsync(fileMocker, async () => {
    const imageResult = await typefs
      .image()
      .withName("gratisography-cool-cat")
      .parse(fileMocker.getCurrentFile());
    expect(imageResult.wasResultSuccessful).toBeTruthy();
    if (!imageResult.wasResultSuccessful) {
      throw new Error(imageResult.errorValue);
    }
    expect(imageResult.okValue.name).toBe("gratisography-cool-cat");
  });
});

test("imageTest5: A image schema with a name should fail if the file does not match the name pattern", async () => {
  const fileMocker = createFileMocker(
    toPath("test-resources/image/imageTest5"),
  ).copyFile(
    toPath("test-resources/gratisography-cool-cat.jpg"),
    toPath("gratisography-cool-cat.jpg"),
  );

  await usingFileMockerAsync(fileMocker, async () => {
    const imageResult = await typefs
      .image()
      .withName("wrong-name")
      .parse(fileMocker.getCurrentFile());
    if (imageResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }
    expect(imageResult.errorValue).toBe("name does not match");
  });
});

test("imageTest6: A image schema with an error handler should parse a image file with the given name", async () => {
  const fileMocker = createFileMocker(
    toPath("test-resources/image/imageTest6"),
  ).copyFile(
    toPath("test-resources/gratisography-cool-cat.jpg"),
    toPath("gratisography-cool-cat.jpg"),
  );

  await usingFileMockerAsync(fileMocker, async () => {
    const spy = vitest.fn();
    const imageResult = await typefs
      .image()
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

test("imageTest7: A image schema with an error handler should fail and call the error handler if the file does not exist", async () => {
  const spy = vitest.fn();
  const imageResult = await typefs
    .image()
    .withName("gratisography-cool-cat")
    .withErrorHandler(spy)
    .parse(toPath("test-resources/image/doesNotExist/test.jpg"));

  if (imageResult.wasResultSuccessful) {
    throw new Error("Expected error");
  }

  expect(spy).toHaveBeenCalled();
});

test("imageTest8: Should fail when image size returns undefined width", async () => {
  const fileMocker = createFileMocker(
    toPath("test-resources/image/imageTest8"),
  ).copyFile(
    toPath("test-resources/gratisography-cool-cat.jpg"),
    toPath("test.jpg"),
  );

  vi.spyOn(fileManagement, "sizeOfAsync").mockResolvedValue({
    wasResultSuccessful: true,
    okValue: { width: undefined, height: 2000 },
  } as any);

  await usingFileMockerAsync(fileMocker, async () => {
    const imageResult = await typefs.image().parse(fileMocker.getCurrentFile());
    if (imageResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }
    expect(imageResult.errorValue).toContain("Invalid image width for");
  });

  vi.restoreAllMocks();
});

test("imageTest9: Should fail when image size returns undefined height", async () => {
  const fileMocker = createFileMocker(
    toPath("test-resources/image/imageTest9"),
  ).copyFile(
    toPath("test-resources/gratisography-cool-cat.jpg"),
    toPath("test.jpg"),
  );

  vi.spyOn(fileManagement, "sizeOfAsync").mockResolvedValue({
    wasResultSuccessful: true,
    okValue: { width: 3000, height: undefined },
  } as any);

  await usingFileMockerAsync(fileMocker, async () => {
    const imageResult = await typefs.image().parse(fileMocker.getCurrentFile());
    if (imageResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }
    expect(imageResult.errorValue).toContain("Invalid image height for");
  });

  vi.restoreAllMocks();
});

test("imageTest10: Should fail when linkCutoff is not in path", async () => {
  const fileMocker = createFileMocker(
    toPath("test-resources/image/imageTest10"),
  ).copyFile(
    toPath("test-resources/gratisography-cool-cat.jpg"),
    toPath("test.jpg"),
  );

  await usingFileMockerAsync(fileMocker, async () => {
    const imageResult = typefs
      .image("/nonexistent/folder")
      .parse(fileMocker.getCurrentFile());
    const result = await imageResult;
    if (result.wasResultSuccessful) {
      throw new Error("Expected error");
    }
    expect(result.errorValue).toBe("image is not in the configured folder");
  });
});

test("imageTest11: Should fail when sizeOfAsync returns error result", async () => {
  const fileMocker = createFileMocker(
    toPath("test-resources/image/imageTest11"),
  ).copyFile(
    toPath("test-resources/gratisography-cool-cat.jpg"),
    toPath("test.jpg"),
  );

  vi.spyOn(fileManagement, "sizeOfAsync").mockResolvedValue({
    wasResultSuccessful: false,
    errorValue: "custom error",
  } as any);

  await usingFileMockerAsync(fileMocker, async () => {
    const imageResult = await typefs.image().parse(fileMocker.getCurrentFile());
    if (imageResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }
    expect(imageResult.errorValue).toContain("Unable to read file");
  });

  vi.restoreAllMocks();
});

test("imageTest12: Should fail when sizeOfAsync returns null value", async () => {
  const fileMocker = createFileMocker(
    toPath("test-resources/image/imageTest12"),
  ).copyFile(
    toPath("test-resources/gratisography-cool-cat.jpg"),
    toPath("test.jpg"),
  );

  vi.spyOn(fileManagement, "sizeOfAsync").mockResolvedValue({
    wasResultSuccessful: true,
    okValue: null,
  } as any);

  await usingFileMockerAsync(fileMocker, async () => {
    const imageResult = await typefs.image().parse(fileMocker.getCurrentFile());
    if (imageResult.wasResultSuccessful) {
      throw new Error("Expected error");
    }
    expect(imageResult.errorValue).toContain("Unable to read file");
  });

  vi.restoreAllMocks();
});
