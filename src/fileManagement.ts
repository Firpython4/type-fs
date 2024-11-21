import { type Dirent, promises as fileSystem } from "node:fs";
import path from "node:path";
import { promisify } from "util";
import sizeOf from "image-size";
import { error, ok, okAsync } from "./result";
import { type Path } from "./types";
import { readdir } from "node:fs/promises";
import process from "node:process";

export async function getFileRelative(filePath: string) {
  return await fileSystem.readFile(path.join(process.cwd(), filePath));
}

export function getPath(dirent: Dirent) {
  return toPath(path.join(dirent.parentPath, dirent.name));
}

export async function readFileSafe(path: Path) {
  try {
    return okAsync(fileSystem.readFile(path));
  } catch {
    return error("could not read file" as const);
  }
}

export async function sizeOfAsync(input: string) {
  try {
    return okAsync(promisify(sizeOf)(input));
  } catch {
    return error("could not open file");
  }
}

export function toPath(path: string) {
  return path as Path;
}

export function safeJoin(path1: Path, path2: Path) {
  return toPath(path.join(path1, path2));
}

export function relativePath(relativePath: Path) {
  return toPath(path.join(process.cwd(), relativePath));
}

export async function safeReadDir(path: Path) {
  try {
    return ok(await readdir(path, { withFileTypes: true }));
  } catch {
    return error("could not read directory");
  }
}
