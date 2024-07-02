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
    const video = await videoUrls.parse(safePath("videos"))

    if (video.wasResultSuccessful) {
        //Inferred as Url[]
        const videoUrls = video.okValue.parsed;

        videoUrls.map(url => console.log(url.url));
    }
}
```
