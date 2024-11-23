import { toPath } from "~/fileManagement";
import { createFileMocker } from "~/tests/shared/mocking/fileMocking";
import { usingFileMockerAsync } from "~/tests/shared/mocking/useFileMocker";
import { expect, test } from "vitest";
import {typefs} from "~/schemas";

 
test("urlTest1: Should parse a valid URL from a .url file", async () => {
    const fileMocker = createFileMocker(toPath("test-resources/url/urlTest1"))
      .createFile(toPath("valid.url"), "https://www.google.com");
  
    await usingFileMockerAsync(fileMocker, async () => {
        const urlSchema = typefs.url();
        const result = await urlSchema.parse(fileMocker.getCurrentFile());
  
      expect(result.wasResultSuccessful).toBeTruthy();
      if (!result.wasResultSuccessful) {
        throw new Error(result.errorValue);
      }
  
      expect(result.okValue.url).toBe("https://www.google.com");
      expect(result.okValue.name).toBe("valid");
    });
  });



test ("urlTest2: Should fail for files with an invalid extension", async()=> {
    const fileMocker = createFileMocker(toPath("test-resources/url/urlTest2"))
    .createFile(toPath("invalid.txt"), "https://www.google.com");

    await usingFileMockerAsync(fileMocker, async () => {
        const urlSchema = typefs.url();
        const result = await urlSchema.parse(fileMocker.getCurrentFile());

        if (result.wasResultSuccessful) {
            throw new Error("Expected an error for invalid extension");
        }
        expect (result.errorValue).toBe("invalid extension");
    });
});


test("urlTest3: Should fail for invalid URL content", async () => {
    const fileMocker = createFileMocker(toPath("test-resources/url/urlTest3"))
      .createFile(toPath("invalid.url"), "not-a-url");
  
    await usingFileMockerAsync(fileMocker, async () => {
      const urlSchema = typefs.url();
      const result = await urlSchema.parse(fileMocker.getCurrentFile());
  
      if (result.wasResultSuccessful) {
        throw new Error("Expected an error for invalid URL content");
      }
  
      expect(result.errorValue).toBe("invalid url");
    });
  });


  test("urlTest4: Should fail for missing file", async () => {
    const urlSchema = typefs.url();
    const result = await urlSchema.parse(toPath("test-resources/url/missing.url"));
  
    if (result.wasResultSuccessful) {
      throw new Error("Expected an error for missing file");
    }
  
    expect(result.errorValue).toBe("could not read file");
  });
  

  test("urlTest5: Should correctly parse URL inside an object schema", async () => {
    const fileMocker = createFileMocker(toPath("test-resources/url/urlTest5"))
      .createFile(toPath("urlField.url"), "https://www.example.com");
  
    await usingFileMockerAsync(fileMocker, async () => {
      const objectSchema = typefs.object({
        url: typefs.url(),
      });
  
      const result = await objectSchema.parse(fileMocker.getCurrentDirectory());
  
      expect(result.wasResultSuccessful).toBeTruthy();
      if (!result.wasResultSuccessful) {
        throw new Error(result.errorValue);
      }
  
      expect(result.okValue.url.url).toBe("https://www.example.com");
      expect(result.okValue.url.name).toBe("urlField");
    });
  });


  test("urlTest6: Optional URL field should not cause an error if missing", async () => {
    const fileMocker = createFileMocker(toPath("test-resources/url/urlTest6"));
  
    await usingFileMockerAsync(fileMocker, async () => {
      const objectSchema = typefs.object({
        url: typefs.url().optional(),
      });
  
      const result = await objectSchema.parse(fileMocker.getCurrentDirectory());
  
      expect(result.wasResultSuccessful).toBeTruthy();
      if (!result.wasResultSuccessful) {
        throw new Error(result.errorValue);
      }
  
      expect(result.okValue.url).toBeUndefined();
    });
  });
  
  