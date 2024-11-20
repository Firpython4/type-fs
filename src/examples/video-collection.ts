import { toPath } from "~/fileManagement";
import typefs from "~/typefs";

//matches a folder named "videos" that contains .url files
const videoUrls = typefs.array(typefs.url()).withName("videos");

async function example() {
    const video = await videoUrls.parse(toPath("videos"))

    if (video.wasResultSuccessful) {
        //Inferred as Url[]
        const videoUrls = video.okValue.parsed;

        videoUrls.map(url => console.log(url.url));
    }
}
