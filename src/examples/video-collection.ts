import { typefs } from "~/schemas";
import { InferOk } from "~/types";

const videoUrls = typefs.array(typefs.url()).withName("videos");

type Videos = InferOk<typeof videoUrls>;