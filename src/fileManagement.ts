import { type Dirent, promises as fileSystem } from "node:fs";
import path from "node:path";
import { promisify } from "util";
import sizeOf from "image-size";
import { error, map, ok, okAsync } from "./result";
import { readdir, readFile } from "node:fs/promises";
import { Path } from "~/types/helpers";

export function getName(inPath: Path) {
  return path.basename(inPath, path.extname(inPath));
}

export async function getUrl(imageOrUrlPath: Path) {
  return (await readFile(imageOrUrlPath)).toString();
}

export async function getUrlFromPath(path: Path) {
  return map(await readFileSafe(path), (value) => value.toString());
}

export async function getFileRelative(filePath: string) {
  return await fileSystem.readFile(path.join(process.cwd(), filePath));
}

export function getPath(dirent: Dirent) {
  return safePath(path.join(dirent.path, dirent.name));
}

export async function readFileSafe(path: Path) {
  try {
    return okAsync(fileSystem.readFile(path));
  } catch (e) {
    return error("could not read file" as const);
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
