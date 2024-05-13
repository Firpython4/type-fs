import { type InferOk } from "../types";
import { typefs } from "../schemas";

const videoUrls = typefs.array(typefs.url()).withName("videos");

type Videos = InferOk<typeof videoUrls>;