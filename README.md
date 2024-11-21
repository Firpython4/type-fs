# type-fs

A file system parser and validator with full type inference. Inspired by Zod. Currently under development.

This package is mainly being used as a library for file-based content management systems on my other projects.

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

I wanted to have a file system parser that I could easily use to define a single source of truth for my file system
entities. I wanted schemas and validators to be inferred from this source of truth. That way, I could quickly respond to
requirements changes by changing the file system schema and the validators would automatically update. This is similar
to how Zod works. I could've used something like [io-ts](https://github.com/gcanti/io-ts), but I wanted full control
over the schema primitives and their parsing logic.

## How?

This package uses TypeScript's type inference to infer a schema's output type from the schema itself. This is done by
recursively traversing the schema and inferring its properties' types.

## Should I use this?

Probably not. This package is still in development and is not ready for production use. I'm primarily using it for my
own projects, so expect breaking changes, bugs, as well as missing features. Also, most new features will most likely
only be added via dogfooding.
