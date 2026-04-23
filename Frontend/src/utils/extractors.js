import { extractTextFromPdf } from "./pdf.js";
import { extractTextFromImage } from "./ocr.js";

export const extractTextFromFile = async (file) => {
  if (!file) {
    return "";
  }

  if (file.type === "application/pdf") {
    return extractTextFromPdf(file);
  }

  if (file.type.startsWith("image/")) {
    return extractTextFromImage(file);
  }

  throw new Error("Unsupported file type.");
};
