import { toPath } from "../fileManagement";
import { typefs } from "../schemas";

//Matches either an image inside the "public/" folder or a .url file
const videoOrImageSchema = typefs.union(typefs.image("public/"), typefs.url());

async function example() {
  const parseResult = await videoOrImageSchema.parse(toPath("video.url"));
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