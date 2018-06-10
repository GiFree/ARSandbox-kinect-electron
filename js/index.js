const Kinect2 = require('kinect2');
const colormap = require('colormap');
const kinect = new Kinect2();

let diff = 26;
let min = 64
let max = () => (min + diff);

const colors = colormap({
  colormap: 'earth',
  nshades: 16,
  format: 'rba',
}).reverse();

document.addEventListener('DOMContentLoaded', () => {

  const canvas = document.getElementById('outputCanvas');
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const imageDataSize = imageData.data.length;
  canvas.focus();
  canvas.addEventListener('keydown', (e) => {
    console.log(e.keyCode);
    if (e.keyCode) {

      if (e.keyCode === 38) {
        min++;
      } else if (e.keyCode === 40) {
        min--;
      } else if (e.keyCode === 39) {
        diff++;
      } else if (e.keyCode === 37) {
        diff--;
      }
    }
  })

  let processing = false;

  if (kinect.open()) {
    kinect.on('depthFrame', function (imageBuffer) {
      if (processing) {
        return;
      }
      processing = true;

      const pixelArray = imageData.data;
      const newPixelData = new Uint8Array(imageBuffer);
      let depthPixelIndex = 0;

      for (let i = 0; i < imageDataSize; i += 4) {

        let grey = newPixelData[depthPixelIndex];

        if (grey > max()) {
          grey = max();
        } else if (grey < min) {
          grey = min;
        }

        const normalized = Math.abs(Math.round((grey - min) / (max() - min) * 15));

        const heat = colors[normalized];

        pixelArray[i] = heat[0];
        pixelArray[i + 1] = heat[1];
        pixelArray[i + 2] = heat[2];
        pixelArray[i + 3] = 0xff;
        depthPixelIndex++;
      }
      ctx.putImageData(imageData, 0, 0);
      processing = false;
    });

    kinect.openDepthReader();
  }
});