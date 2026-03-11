const params = new URLSearchParams(window.location.search);
const nameInput = document.getElementById('name');
const fileInput = document.getElementById('photo');
const generateBtn = document.getElementById('generate');
const downloadBtn = document.getElementById('download');
const shareOutput = document.getElementById('share');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let loadedImage = null;

nameInput.value = params.get('name') || '';

drawPlaceholder();
updateShareUrl();

fileInput.addEventListener('change', async (event) => {
  const [file] = event.target.files || [];
  if (!file) return;

  loadedImage = await loadImageFromFile(file);
  render();
});

nameInput.addEventListener('input', () => {
  render();
  updateShareUrl();
});

generateBtn.addEventListener('click', () => {
  render();
  updateShareUrl();
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'meme-personalizado.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

function drawPlaceholder() {
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 42px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Sube una foto para empezar', canvas.width / 2, canvas.height / 2);
}

function render() {
  const name = sanitizeName(nameInput.value);

  if (!loadedImage) {
    drawPlaceholder();
    if (name) drawCaption(name);
    return;
  }

  const crop = getSquareCrop(loadedImage.width, loadedImage.height);
  ctx.drawImage(
    loadedImage,
    crop.x,
    crop.y,
    crop.size,
    crop.size,
    0,
    0,
    canvas.width,
    canvas.height
  );

  drawCaption(name);
}

function drawCaption(name) {
  const text = `${name || 'Alguien'} es una verga!`;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.56)';
  ctx.fillRect(0, canvas.height - 170, canvas.width, 170);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 74px sans-serif';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 8;
  ctx.strokeText(text, canvas.width / 2, canvas.height - 70);
  ctx.fillText(text, canvas.width / 2, canvas.height - 70);
}

function sanitizeName(value) {
  return value.replace(/\s+/g, ' ').trim().slice(0, 30);
}

function getSquareCrop(width, height) {
  const size = Math.min(width, height);
  return {
    size,
    x: Math.floor((width - size) / 2),
    y: Math.floor((height - size) / 2)
  };
}

function updateShareUrl() {
  const name = sanitizeName(nameInput.value);
  const url = new URL(window.location.href);

  if (name) {
    url.searchParams.set('name', name);
  } else {
    url.searchParams.delete('name');
  }

  shareOutput.textContent = `URL para compartir: ${url.toString()}`;
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
      img.onload = () => resolve(img);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
