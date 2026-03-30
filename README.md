# type-fs

[![npm](https://img.shields.io/npm/v/@firpy/type-fs)](https://www.npmjs.com/package/@firpy/type-fs)
[![github-repo](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/Firpython4/type-fs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A file system parser and validator with full type inference. Inspired by Zod.

## Features

- **Type Inference** - Schemas automatically infer TypeScript types from file system structures
- **Schema Composition** - Combine primitives with unions, arrays, and objects
- **Validation** - Parse and validate files and directories with detailed error reporting
- **Discriminated Unions** - Type-safe handling of multiple schema variants

## Installation

```bash
npm install @firpy/type-fs
```

## Quick Start

```ts
import { typefs, safePath } from "@firpy/type-fs";

// Define a schema for image files
const imageSchema = typefs.image("public/");

// Parse a file and get type-safe results
async function main() {
  const result = await imageSchema.parse(safePath("public/photo.jpg"));

  if (result.wasResultSuccessful) {
    // TypeScript knows the exact shape!
    console.log(result.okValue.width, result.okValue.height);
  }
}
```

## Examples

### Video or image

```ts
//Matches either an image inside the "public/" folder or a .url file
const videoOrImageSchema = typefs.union(typefs.image("public/"), typefs.url());

async function example() {
  const parseResult = await videoOrImageSchema.parse(safePath("video.url"));
  if (parseResult.wasResultSuccessful) {
    //Inferred as a discriminated union of Image and Url
    const videoOrImage = parseResult.okValue;

    if (videoOrImage.option === 0) {
      /* Both are inferred as numbers because
      videoOrImage.value is inferred as an Image */
      const [width, height] = [
        videoOrImage.value.width,
        videoOrImage.value.height,
      ];

      console.log(width, height);
    } else {
      //videoOrImage.value is inferred as a Url
      const videoUrl = videoOrImage.value.url;

      console.log(videoUrl);
    }
  }
}
```

### Video collection

```ts
//matches a folder named "videos" that contains .url files
const videoUrls = typefs.array(typefs.url()).withName("videos");

async function example() {
  const video = await videoUrls.parse(safePath("videos"));

  if (video.wasResultSuccessful) {
    //Inferred as Url[]
    const videoUrls = video.okValue.parsed;

    videoUrls.map((url) => console.log(url.url));
  }
}
```

## Why?

I wanted a file system parser that defines a single source of truth for file system entities. Schemas and validators are inferred from this source of truth, so requirements changes automatically propagate to type-safe validators. This is similar to how [Zod](https://zod.dev/) works. I could've used [io-ts](https://github.com/gcanti/io-ts), but I wanted full control over schema primitives and parsing logic.

## How?

This package uses TypeScript's type inference to infer a schema's output type from the schema itself by recursively traversing the schema and inferring its properties' types.

## Status

This package is under active development. Expect breaking changes between minor versions. It's being used in production for file-based content management systems.
