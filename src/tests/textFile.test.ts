import { toPath } from "~/fileManagement";
import { createFileMocker } from "~/tests/shared/mocking/fileMocking";
import { usingFileMockerAsync } from "~/tests/shared/mocking/useFileMocker";
import { expect, test } from "vitest";
import {typefs} from "~/schemas";
import {vitest} from "vitest";

test("textFileTest1: Should parse content from a .txt file", async () => {
    const fileMocker = createFileMocker(toPath("test-resources/textFile/textFileTest1"))
      .createFile(toPath("valid.txt"), "Hello World");

    await usingFileMockerAsync(fileMocker, async () => {
        const urlSchema = typefs.textFile()
        const result = await urlSchema.parse(fileMocker.getCurrentFile());
  
      expect(result.wasResultSuccessful).toBeTruthy();
      if (!result.wasResultSuccessful) {
        throw new Error(result.errorValue);
      }
  
      expect(result.okValue.toString()).toBe("Hello World");
    });
  });

test ("textFileTest2: Should fail for files with an invalid extension", async() => {
    const fileMocker = createFileMocker(toPath("test-resources/textFile/textFileTest2"))
      .createFile(toPath("invalid.url"), "https://www.google.com");

    await usingFileMockerAsync(fileMocker, async () => {
        const textFileSchema = typefs.textFile();
        const result = await textFileSchema.parse(fileMocker.getCurrentFile());

        if (result.wasResultSuccessful) {
            throw new Error("Expected an error for invalid extension");
        }
        expect (result.errorValue).toBe("invalid extension");
    });
});

test("textFileTest3: Should fail for missing file", async () => {
    const textFileSchema = typefs.textFile();
    const result = await textFileSchema.parse(toPath("test-resources/textFile/missing.txt"));

    if (result.wasResultSuccessful) {
      throw new Error("Expected an error for missing file");
    }

    expect(result.errorValue).toBe("could not read file");
});

test("textFileTest4: Should correctly parse a text file inside an object schema", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/textFile/textFileTest4"))
    .createFile(toPath("urlField.txt"), "Hello World");

  const objectSchema = typefs.object({
    textFile: typefs.textFile(),
  });

  await usingFileMockerAsync(fileMocker, async () => {
    const result = await objectSchema.parse(fileMocker.getCurrentDirectory());
    expect(result.wasResultSuccessful).toBeTruthy();
    if (!result.wasResultSuccessful) {
      throw new Error(result.errorValue);
    }

    expect(result.okValue.textFile.toString()).toBe("Hello World");
  });
});

test("textFileTest5: Optional text file field should parse a text file", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/textFile/textFileTest5"))
    .createFile(toPath("a.txt"), "Hello World");

  await usingFileMockerAsync(fileMocker, async () => {
    const objectSchema = typefs.object({
      textFile: typefs.textFile().optional(),
    });

    const result = await objectSchema.parse(fileMocker.getCurrentDirectory());
    expect(result.wasResultSuccessful).toBeTruthy();
    if (!result.wasResultSuccessful) {
      throw new Error(result.errorValue);
    }

    expect(result.okValue.textFile!.toString()).toBe("Hello World");
  });
});

test("textFileTest6: Optional text file field should not cause an error if missing", async () => {
  const objectSchema = typefs.object({
    textFile: typefs.textFile().optional(),
  });

  const fileMocker = createFileMocker(toPath("test-resources/textFile/textFileTest6"));

  await usingFileMockerAsync(fileMocker, async () => {
    const result = await objectSchema.parse(fileMocker.getCurrentDirectory());
    expect(result.wasResultSuccessful).toBeTruthy();
    if (!result.wasResultSuccessful) {
      throw new Error(result.errorValue);
    }

    expect(result.okValue.textFile).toBeUndefined();
  });
});

test("textFileTest7: A named text file schema should parse a text file", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/textFile/textFileTest7"))
    .createFile(toPath("a.txt"), "Hello World");

  await usingFileMockerAsync(fileMocker, async () => {
    const urlSchema = typefs.textFile().withName("a");
    const result = await urlSchema.parse(fileMocker.getCurrentFile());

    expect(result.wasResultSuccessful).toBeTruthy();
    if (!result.wasResultSuccessful) {
      throw new Error(result.errorValue);
    }

    expect(result.okValue.parsed.toString()).toBe("Hello World");
    expect(result.okValue.name).toBe("a");
  });
});

test("textFileTest8: A text file schema with a name should fail if the file does not match the name pattern", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/textFile/textFileTest8"))
    .createFile(toPath("a.txt"), "Hello World");

  await usingFileMockerAsync(fileMocker, async () => {
    const urlSchema = typefs.textFile().withName("b");
    const result = await urlSchema.parse(fileMocker.getCurrentFile());
    if (result.wasResultSuccessful) {
      throw new Error("Expected error");
    }
    expect(result.errorValue).toBe("name does not match");
  });
});

test("textFileTest9: A text file schema with an error handler should parse a text file", async () => {
  const fileMocker = createFileMocker(toPath("test-resources/textFile/textFileTest9"))
    .createFile(toPath("a.txt"), "Hello World");

  await usingFileMockerAsync(fileMocker, async () => {
    const spy = vitest.fn();
    const urlSchema = typefs.textFile()
      .withErrorHandler(spy)
      .withName("a");
    const result = await urlSchema.parse(fileMocker.getCurrentFile());

    expect(result.wasResultSuccessful).toBeTruthy();
    if (!result.wasResultSuccessful) {
      throw new Error("Expected error");
    }

    expect(spy).not.toHaveBeenCalled();
  });
});

test("textFileTest10: A text file schema with an error handler should fail and call the error handler if parsing fails", async () => {
  const spy = vitest.fn();
  const urlSchema = typefs.textFile()
    .withName("a")
    .withErrorHandler(spy);

  const result = await urlSchema.parse(toPath("test-resources/url/doesNotExist"));
  if (result.wasResultSuccessful) {
    throw new Error("Expected error");
  }

  expect(spy).toHaveBeenCalled();
});