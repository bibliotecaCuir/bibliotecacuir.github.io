const coverImage = document.querySelector(".ficha-portada-marco img[data-remove-white-bg]");

function isBackgroundPixel(data, index) {
  const red = data[index];
  const green = data[index + 1];
  const blue = data[index + 2];
  const alpha = data[index + 3];
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);

  return alpha > 0 && red > 226 && green > 226 && blue > 226 && max - min < 24;
}

function removeEdgeWhiteBackground(img) {
  if (!img?.naturalWidth || !img?.naturalHeight) return;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const width = img.naturalWidth;
  const height = img.naturalHeight;
  const totalPixels = width * height;

  if (!context || totalPixels > 10000000) return;

  canvas.width = width;
  canvas.height = height;
  context.drawImage(img, 0, 0);

  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;
  const visited = new Uint8Array(totalPixels);
  const stack = [];

  function pushIfBackground(pixel) {
    if (pixel < 0 || pixel >= totalPixels || visited[pixel]) return;
    const offset = pixel * 4;
    if (!isBackgroundPixel(data, offset)) return;
    visited[pixel] = 1;
    stack.push(pixel);
  }

  for (let x = 0; x < width; x += 1) {
    pushIfBackground(x);
    pushIfBackground((height - 1) * width + x);
  }

  for (let y = 0; y < height; y += 1) {
    pushIfBackground(y * width);
    pushIfBackground(y * width + width - 1);
  }

  while (stack.length) {
    const pixel = stack.pop();
    data[pixel * 4 + 3] = 0;

    const x = pixel % width;
    if (x > 0) pushIfBackground(pixel - 1);
    if (x < width - 1) pushIfBackground(pixel + 1);
    if (pixel >= width) pushIfBackground(pixel - width);
    if (pixel < totalPixels - width) pushIfBackground(pixel + width);
  }

  context.putImageData(imageData, 0, 0);
  img.src = canvas.toDataURL("image/png");
  img.classList.add("esta-fondo-removido");
}

if (coverImage) {
  coverImage.crossOrigin = "anonymous";

  if (coverImage.complete) {
    try {
      removeEdgeWhiteBackground(coverImage);
    } catch (error) {
      coverImage.classList.add("esta-fondo-conservado");
    }
  } else {
    coverImage.addEventListener("load", () => {
      try {
        removeEdgeWhiteBackground(coverImage);
      } catch (error) {
        coverImage.classList.add("esta-fondo-conservado");
      }
    }, { once: true });
  }
}
