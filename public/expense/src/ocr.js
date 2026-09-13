/**
 * ocr.js — reading text off a payment screenshot, on the phone.
 *
 * Tesseract.js runs the recognition in a worker on-device. That matters for
 * more than privacy: a cloud OCR API would mean an API key in a static bundle
 * that anyone can read, a per-image cost, and an app that stops working the
 * moment there is no signal. None of that is acceptable for something whose
 * whole job is to be faster than typing.
 *
 * The price is a one-time ~15MB download of the engine and English data. The
 * service worker keeps it afterwards, so it is paid once and the app is fully
 * offline from then on.
 */

const TESSERACT_JS = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";

let scriptPromise = null;
let worker = null;

function loadTesseract() {
  if (globalThis.Tesseract) return Promise.resolve(globalThis.Tesseract);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = TESSERACT_JS;
    el.onload = () => resolve(globalThis.Tesseract);
    el.onerror = () => {
      scriptPromise = null;
      reject(new Error("offline-first-run"));
    };
    document.head.appendChild(el);
  });
  return scriptPromise;
}

/**
 * Prepare the image for recognition.
 *
 * This is doing more work than it looks like it should, and it is the
 * difference between reading the amount and not. Payment apps are dark themes,
 * and Tesseract is trained on dark-on-light print — handed a light-on-dark
 * screenshot it returns close to nothing. Inverting when the image is
 * predominantly dark is the single highest-value step here.
 */
function preprocess(image) {
  const targetWidth = 1000;
  const scale = image.width > targetWidth ? targetWidth / image.width : 1;
  const w = Math.max(1, Math.round(image.width * scale));
  const h = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, w, h);

  const frame = ctx.getImageData(0, 0, w, h);
  const px = frame.data;

  // Greyscale, and measure the overall brightness while we are already here.
  let sum = 0;
  for (let i = 0; i < px.length; i += 4) {
    const g = px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
    px[i] = px[i + 1] = px[i + 2] = g;
    sum += g;
  }

  const mean = sum / (px.length / 4);
  const invert = mean < 110;
  const contrast = 1.6;

  for (let i = 0; i < px.length; i += 4) {
    let v = invert ? 255 - px[i] : px[i];
    v = (v - 128) * contrast + 128;
    px[i] = px[i + 1] = px[i + 2] = v < 0 ? 0 : v > 255 ? 255 : v;
  }

  ctx.putImageData(frame, 0, 0);
  return canvas;
}

async function toImage(blob) {
  if (globalThis.createImageBitmap) {
    try {
      return await createImageBitmap(blob);
    } catch {
      // Fall through to the <img> path below.
    }
  }
  const src = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error("unreadable-image"));
      img.src = src;
    });
    return img;
  } finally {
    // Safe once decoded; the canvas draw below reads from the decoded bitmap.
    setTimeout(() => URL.revokeObjectURL(src), 10000);
  }
}

async function getWorker(onProgress) {
  const Tesseract = await loadTesseract();
  if (worker) return worker;

  worker = await Tesseract.createWorker("eng", 1, {
    logger: (m) => {
      if (!onProgress) return;
      if (m.status === "recognizing text") onProgress("Reading", m.progress);
      else if (/traineddata|loading|initializ/i.test(m.status)) onProgress("Preparing", m.progress);
    },
  });
  return worker;
}

/**
 * Recognise text in an image blob.
 * @param {Blob} blob
 * @param {(stage: string, progress: number) => void} [onProgress]
 * @returns {Promise<string>}
 */
export async function recognize(blob, onProgress) {
  const image = await toImage(blob);
  const canvas = preprocess(image);
  if (image.close) image.close();

  const w = await getWorker(onProgress);
  const { data } = await w.recognize(canvas);
  return data?.text || "";
}

/** Whether the engine is already downloaded and warm. */
export function isReady() {
  return Boolean(worker);
}
