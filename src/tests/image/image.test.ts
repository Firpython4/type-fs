import { createFileMocker } from "~/tests/fileMocking";
import { relativePath, toPath } from "~/fileManagement";
import { test, expect } from "vitest";
import { usingFileMockerAsync } from "~/tests/usingMockingContext";
import typefs from "~/typefs";

test("The image schema should parse an image", async () => {
  const fileMocker = createFileMocker(relativePath(toPath("test-resources/image/imageTest")))
    .copyFile(relativePath(toPath("test-resources/gratisography-cool-cat.jpg")), toPath("gratisography-cool-cat.jpg"))

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
  })});