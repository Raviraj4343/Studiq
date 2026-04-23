import { createWorker } from "tesseract.js";
import englishDataUrl from "@tesseract.js-data/eng/4.0.0/eng.traineddata.gz?url";
import workerUrl from "tesseract.js/dist/worker.min.js?url";
import coreUrl from "tesseract.js-core/tesseract-core-lstm.wasm.js?url";

const langPath = englishDataUrl.slice(0, englishDataUrl.lastIndexOf("/"));

export const extractTextFromImage = async (file) => {
  const worker = await createWorker("eng", 1, {
    langPath,
    workerPath: workerUrl,
    corePath: coreUrl,
    gzip: true
  });

  try {
    const result = await worker.recognize(file);
    return result.data.text?.trim() || "";
  } finally {
    await worker.terminate();
  }
};
