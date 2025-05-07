'use client';

import Cropper from 'react-easy-crop';
import { useDropzone } from 'react-dropzone';
import { useCallback, useState, useRef } from 'react';

function getPrettyClassName(className) {
  // Quitar prefijo numérico y punto
  let name = className;
  if (typeof name === 'string') {
    name = name.replace(/^\d+\./, '');
    let parts = name.split('_');
    // Si termina en "macho" o "hembra", lo quitamos
    if (parts[parts.length - 1] === 'macho' || parts[parts.length - 1] === 'hembra') {
      parts = parts.slice(0, -1);
    }
    // El nombre científico siempre son las dos últimas partes
    const nombreComunParts = parts.slice(0, -2);
    // Si solo hay una palabra, igual funciona
    name = nombreComunParts.join(' ');
    // Capitalizar primera letra de cada palabra
    name = name.replace(/\b\w/g, l => l.toUpperCase());
  }
  return name;
}

function getGenero(className) {
  if (typeof className !== 'string') return '';
  const parts = className.split('_');
  const last = parts[parts.length - 1];
  if (last === 'macho' || last === 'hembra') {
    return last.charAt(0).toUpperCase() + last.slice(1);
  }
  return '';
}

function getCroppedImg(imageSrc, croppedAreaPixels, callback) {
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

// Cambia esta variable por la IP de tu PC en la red local para usar el backend desde el celular
const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  ? `http://192.168.0.100:5000/predict` // <-- Cambia 192.168.1.100 por la IP de tu PC
  : 'http://localhost:5000/predict';

export default function ImageDropzone() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const debounceRef = useRef();

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setResult(null);
    setPreview(URL.createObjectURL(file));
    setImageLoaded(false);
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      'image/*': []
    }
  });

  // Cuando el usuario deja de mover/zoom, recorta y envía la imagen
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (preview && croppedAreaPixels) {
        setLoading(true);
        getCroppedImg(preview, croppedAreaPixels, (blob) => {
          const formData = new FormData();
          formData.append('file', blob, 'cropped.jpg');
          fetch(BACKEND_URL, {
            method: 'POST',
            body: formData,
          })
            .then(res => res.json())
            .then(data => setResult(data))
            .catch(() => setResult({ class: 'Error' }))
            .finally(() => setLoading(false));
        });
      }
    }, 600); // 600ms debounce
  }, [preview]);

  const handleReset = () => {
    setResult(null);
    setPreview(null);
    setLoading(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setImageLoaded(false);
  };

  const isCentered = !preview;

  return (
    <div className={`main-content flex flex-col ${isCentered ? 'items-center justify-center' : 'md:flex-row items-center justify-center'} min-h-[90vh] w-full gap-12`}>
      {/* Panel izquierdo: Imagen y crop */}
      <div className={`w-full ${isCentered ? 'max-w-2xl' : 'w-[92vw] max-w-[340px] md:w-[600px] md:max-w-[600px]'} flex flex-col items-center bg-gradient-to-br bg-white/90 rounded-3xl shadow-2xl border-[6px] border-green-500 p-4 md:p-10 relative z-10`}>
        <h2 className="text-4xl font-extrabold text-green-700 mb-6 flex items-center gap-3 drop-shadow-lg">
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path fill="#4CAF50" d="M2 20l2-2h16l2 2v1H2v-1zm2-2V4a2 2 0 012-2h12a2 2 0 012 2v14H4zm2-2h12V4H6v12z"/></svg>
          Identificación de Ave
        </h2>
        <div
          {...getRootProps()}
          className="cursor-pointer w-full flex flex-col items-center"
        >
          <input {...getInputProps()} />
          {!preview ? (
            <div
              className="flex flex-col items-center justify-center h-[92vw] w-[92vw] max-h-[340px] max-w-[340px] min-h-[160px] min-w-[160px] md:w-[520px] md:h-[520px] md:max-w-[520px] md:max-h-[520px] border-4 border-dashed border-green-400 rounded-2xl bg-green-100/60"
              onClick={open}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') open(); }}
              style={{ outline: 'none' }}
            >
              <img src="/binoculars.svg" alt="Silueta de ave" className="w-24 h-24 md:w-32 md:h-32 opacity-70" />
              <p className="text-xl md:text-2xl text-green-800 mt-4 font-semibold">Arrastrá o seleccioná una imagen</p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <p className="text-3xl font-bold text-green-800 mb-2 drop-shadow">{getPrettyClassName(result?.class || '')}</p>
              {getGenero(result?.class || '') && (
                <p className="text-xl text-blue-700 mb-3 font-semibold">{getGenero(result?.class || '')}</p>
              )}
              <div className="relative w-[92vw] h-[92vw] max-w-[320px] max-h-[320px] min-w-[160px] min-h-[160px] md:w-[520px] md:h-[520px] md:max-w-[520px] md:max-h-[520px] bg-black rounded-2xl overflow-hidden mb-6 border-4 border-green-400 shadow-lg">
                <Cropper
                  image={preview}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  onMediaLoaded={() => setImageLoaded(true)}
                  showGrid={false}
                  cropShape="rect"
                  maxZoom={5}
                />
              </div>
              <div className="flex gap-4 items-center w-full justify-center mb-3">
                <label className="text-lg text-green-800 font-semibold">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.01}
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  className="w-72 accent-green-600"
                />
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-lg shadow-lg font-bold"
              >
                Cargar otra imagen
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Panel derecho: Info del ave */}
      {!isCentered && (
        <div className="w-full md:w-[600px] flex flex-col items-center">
          <div className="w-full max-w-2xl">
            {loading && (
              <div className="flex flex-col items-center justify-center h-[300px]">
                <svg className="animate-spin" width="64" height="64" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="6" opacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#4CAF50" strokeWidth="6" strokeLinecap="round"/></svg>
                <span className="text-green-700 font-semibold mt-4 text-2xl">Procesando imagen...</span>
              </div>
            )}

            {!loading && result && (
              <div className="mt-4 bg-white/95 border-4 border-green-400 rounded-3xl shadow-2xl p-10 flex flex-col gap-4">
                <div className="flex items-center gap-4 mb-4">
                  <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path fill="#4CAF50" d="M2 20l2-2h16l2 2v1H2v-1zm2-2V4a2 2 0 012-2h12a2 2 0 012 2v14H4zm2-2h12V4H6v12z"/></svg>
                  <span className="text-4xl font-extrabold text-green-800 drop-shadow-lg">{getPrettyClassName(result.class)}</span>
                  {getGenero(result.class) && (
                    <span className="ml-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-2xl font-bold shadow">{getGenero(result.class)}</span>
                  )}
                </div>
                {result.confidence !== undefined && (
                  <div className="flex items-center gap-3">
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#FFEB3B" strokeWidth="4"/><path d="M12 6v6l4 2" stroke="#FFEB3B" strokeWidth="3" strokeLinecap="round"/></svg>
                    <span className="text-yellow-700 font-bold text-xl">Confianza: {(result.confidence * 100).toFixed(2)}%</span>
                  </div>
                )}
                {result.ebird_info ? (
                  <div className="mt-4 flex flex-col gap-3 text-2xl">
                    <div className="flex items-center gap-3">
                      <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#2196F3" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>
                      <span className="text-green-900"><b>Nombre común:</b> {result.ebird_info.comName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#2196F3" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>
                      <span className="italic text-green-900"><b>Nombre científico:</b> {result.ebird_info.sciName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#4CAF50" d="M12 2a10 10 0 1 1 0 20 10 10 10 0 0 1 0-20zm0 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>
                      <span className="text-green-900"><b>Familia:</b> {result.ebird_info.familyComName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#4CAF50" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>
                      <span className="text-green-900"><b>Orden:</b> {result.ebird_info.order}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#FFEB3B" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>
                      <span className="text-green-900"><b>Categoría:</b> {result.ebird_info.category}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-600 mt-6 text-2xl">No se encontró información en eBird.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
