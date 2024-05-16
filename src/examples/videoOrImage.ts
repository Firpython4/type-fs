import { typefs } from "../schemas";
import { type InferOk } from "../types";

const videoOrImageSchema = typefs.union(typefs.image("public/"), typefs.url());

type VideoOrImage = InferOk<typeof videoOrImageSchema>;
declare const videoOrImage: VideoOrImage;
function example() {
  if (videoOrImage.option === 0) {
    const [width, height] = [
      videoOrImage.value.width,
      videoOrImage.value.height,
    ];
  } else {
    const videoUrl = videoOrImage.value.url;
  }
}
