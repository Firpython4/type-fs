import { type Dirent, promises as fileSystem } from "node:fs";
import path from "node:path";
import {
  collectionsPath,
  type PublicFolder,
  publicFolderValue,
} from "~/config";
import { type StringWithInnerSubstring } from "~/cms/type-fs/typeSafety";
import { type Locale, locales } from "~/localization/localization";
import { promisify } from "util";
import sizeOf from "image-size";
import { error, ok, okAsync } from "./result";
import { type Path } from "./types";
import { readdir } from "node:fs/promises";

export async function getAllCollections() {
  return await fileSystem.readdir(path.join(process.cwd(), collectionsPath), {
    withFileTypes: true,
  });
}
export async function getFileRelative(filePath: string) {
  return await fileSystem.readFile(path.join(process.cwd(), filePath));
}

export const absoluteToRelativePath = (imagePath: PublicFolderPath) =>
  imagePath.split(path.join(publicFolderValue))[1]! as PublicFolderPath;

export const removeExtension = (name: Dirent) =>
  name.name.replace(path.extname(name.name), "");

export function getPath(dirent: Dirent) {
  return safePath(path.join(dirent.path, dirent.name));
}

export function getExtension(inPath: Path) {
  return path.extname(inPath);
}

export async function getVideoUrl(imageOrUrlPath: `${string}public${string}`) {
  return (await fileSystem.readFile(imageOrUrlPath)).toString();
}

export async function readFileSafe(path: Path) {
  try {
    return okAsync(fileSystem.readFile(path));
  } catch (e) {
    return error("could not read file" as const);
  }
}

export async function exists(path: string) {
  try {
    await fileSystem.access(path);
    return true;
  } catch (error) {
    return false;
  }
}

const supportedImageFormats = [
  ".png" as const,
  ".jpg" as const,
  ".jpeg" as const,
  ".webp" as const,
];
export type ImageExtension = (typeof supportedImageFormats)[number];

export function isImageExtension(
  extension: string,
): extension is ImageExtension {
  for (const element of supportedImageFormats) {
    if (extension === element) {
      return true;
    }
  }

  return false;
}

export type PublicFolderPath = StringWithInnerSubstring<PublicFolder>;

export function typeSafePathJoin<PathType extends string>(
  substringPath: StringWithInnerSubstring<PathType>,
  ...paths: string[]
) {
  return path.join(
    substringPath,
    ...paths,
  ) as StringWithInnerSubstring<PathType>;
}

export async function importAsImage(imagePath: PublicFolderPath) {
  for (const imageFormat of supportedImageFormats) {
    let relativePath: string | undefined = undefined;
    const absolutePath = `${imagePath}${imageFormat}` as PublicFolderPath;
    if (await exists(absolutePath)) {
      relativePath = absoluteToRelativePath(absolutePath);
      return { relativePath, absolutePath };
    }
  }
}

export async function sizeOfAsync(input: string) {
  try {
    return okAsync(promisify(sizeOf)(input));
  } catch (e) {
    return error("could not open file");
  }
}

export function safePath(path: string) {
  return path as Path;
}

export function safeJoin(...paths: string[]) {
  return safePath(path.join(...paths));
}

export function relativePath(relativePath: Path) {
  return safePath(path.join(process.cwd(), relativePath));
}

export async function safeReadDir(path: Path) {
  try {
    return ok(await readdir(path, { withFileTypes: true }));
  } catch (e) {
    return error("could not read directory");
  }
}
