import * as faceDetection from "@tensorflow-models/face-detection";
import "@tensorflow/tfjs";

let detector = null;

export async function initFaceDetector() {
if (detector) return detector;

detector = await faceDetection.createDetector(
faceDetection.SupportedModels.MediaPipeFaceDetector,
{ runtime: "tfjs" }
);

return detector;
}

export async function detectFaces(videoEl) {
if (!detector || !videoEl) return [];
return await detector.estimateFaces(videoEl);
}


