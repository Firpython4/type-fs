// import { createFileMocker } from "~/tests/fileMocking";
// import { relativePath, toPath } from "~/fileManagement";
// import { test, expect } from "vitest";
// import { usingFileMockerAsync } from "~/tests/usingMockingContext";
// import typefs from "~/typefs";
//
// test("The image schema should parse an image", async () => {
//   const fileMocker = createFileMocker(relativePath(toPath("test-resources/image/imageTest")))
//     .copyFile(relativePath(toPath("test-resources/a.webp")), toPath("a.webp"))
//
//   await usingFileMockerAsync(fileMocker, async () => {
//     const imageResult = await typefs.image().parse(fileMocker.getCurrentFile());
//     expect(imageResult.wasResultSuccessful).toBeTruthy();
//     if (!imageResult.wasResultSuccessful) {
//       throw new Error(imageResult.errorValue);
//     }
//
//     expect(imageResult.okValue.type).toBe("image");
//     expect(imageResult.okValue.name).toBe("a");
//     expect(imageResult.okValue.width).toBe(170);
//     expect(imageResult.okValue.height).toBe(302);
//   })});