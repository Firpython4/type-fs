import * as fileSystem from "node:fs"
import path from "node:path";
import { Path } from "~/types/helpers";
import { safeJoin } from "~/fileManagement";

export type FileMockingContext = {
  getCurrentDirectory(): string & { __brand: "path" };
  cleanup(): void;
  createDirectory(inPath: Path): {
    getCurrentDirectory(): string & { __brand: "path" };
    cleanup(): void;
    createDirectory(inPath: Path): any;
    createFile(inPath: Path, content: string): any
  };
  createFile(inPath: Path, content: string): {
    getCurrentDirectory(): string & { __brand: "path" };
    cleanup(): void;
    createDirectory(inPath: Path): any;
    createFile(inPath: Path, content: string): any
  }
};

export function createFileMocker(inPath: Path) {
  const out = {
    __currentDirectory: inPath,
    __filesToDelete: new Array<string>(),
    __directoriesToDelete: new Array<string>(),

    getCurrentDirectory() {
      return out.__currentDirectory;
    },

    createFile(inPath: Path, content: string) {
      fileSystem.writeFileSync(path.join(out.__currentDirectory, inPath), content);

      if (out.__currentDirectory === inPath && !out.__filesToDelete.includes(inPath)) {
        out.__filesToDelete.push(inPath);
      }

      return out;
    },
    createDirectory(inPath: Path) {
      const newPath = safeJoin(out.__currentDirectory, inPath);
      fileSystem.mkdirSync(newPath);
      out.__currentDirectory = newPath;

      if (!out.__directoriesToDelete.includes(inPath)) {
        out.__directoriesToDelete.push(inPath);
      }

      return out;
    },
    cleanup() {
      for (const file of out.__filesToDelete) {
        fileSystem.rmSync(path.join(out.__currentDirectory, file));
      }

      for (const directory of out.__directoriesToDelete) {
        fileSystem.rmSync(path.join(inPath, directory), { recursive: true });
      }
    }
  };
  return out;
}
