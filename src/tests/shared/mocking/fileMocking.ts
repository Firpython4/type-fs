import * as fileSystem from "node:fs";
import path from "node:path";
import { safeJoin, toPath } from "~/fileManagement";
import { type Path} from "~/types";

export type FileMocker = {
  getCurrentDirectory(): string & { __brand: "path" };
  cleanup(): void;
  createDirectory(inPath: Path): {
    getCurrentDirectory(): string & { __brand: "path" };
    cleanup(): void;
    createDirectory(inPath: Path): FileMocker;
    createFile(inPath: Path, content: string): FileMocker
  };
  createFile(inPath: Path, content: string): {
    getCurrentDirectory(): string & { __brand: "path" };
    cleanup(): void;
    createDirectory(inPath: Path): FileMocker;
    createFile(inPath: Path, content: string): FileMocker
  }
};

export function createFileMocker(inPath: Path) {
  const out = {
    __currentDirectory: "" as Path,
    __currentFile: "" as Path,

    getCurrentDirectory() {
      return out.__currentDirectory;
    },

    getCurrentFile() {
      return safeJoin(out.__currentDirectory, out.__currentFile);
    },

    createFile(inPath: Path, content: string) {
      fileSystem.writeFileSync(path.join(out.__currentDirectory, inPath), content);

      out.__currentFile = inPath;
      return out;
    },
    createDirectory(inPath: Path) {
      const newPath = safeJoin(out.__currentDirectory, inPath);
      fileSystem.mkdirSync(newPath, { recursive: true });
      out.__currentDirectory = newPath;

      return out;
    },

    copyFile(inPath: Path, outPath: Path) {
      fileSystem.copyFileSync(inPath, path.join(out.__currentDirectory, outPath));
      out.__currentFile = outPath;
      return out;
    },

    goBack() {
      out.__currentDirectory = safeJoin(out.__currentDirectory, toPath(".."));
      return out;
    },

    cleanup() {
      fileSystem.rmSync(inPath, { recursive: true });
    }
  };
  return out.createDirectory(inPath);
}
