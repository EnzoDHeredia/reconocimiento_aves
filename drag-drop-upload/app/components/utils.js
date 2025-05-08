// Convierte el nombre de clase a un formato legible
export function getPrettyClassName(className) {
  let name = className;
  if (typeof name === 'string') {
    name = name.replace(/^[\d]+\./, '');
    let parts = name.split('_');
    if (parts[parts.length - 1] === 'macho' || parts[parts.length - 1] === 'hembra') {
      parts = parts.slice(0, -1);
    }
    const nombreComunParts = parts.slice(0, -2);
    name = nombreComunParts.join(' ');
    name = name.replace(/\b\w/g, l => l.toUpperCase());
  }
  return name;
}

// Extrae el género del nombre científico
export function getGenero(className) {
  if (typeof className !== 'string') return '';
  const parts = className.split('_');
  const last = parts[parts.length - 1];
  if (last === 'macho' || last === 'hembra') {
    return last.charAt(0).toUpperCase() + last.slice(1);
  }
  return '';
}

// Recorta la imagen usando canvas
export function getCroppedImg(imageSrc, croppedAreaPixels, callback) {
  const image = new window.Image();
  image.src = imageSrc;
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      224,
      224
    );
    canvas.toBlob((blob) => {
      callback(blob);
    }, 'image/jpeg');
  };
}
