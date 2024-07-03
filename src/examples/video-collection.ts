import { safePath } from "../fileManagement";
import { typefs } from "../schemas";

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
