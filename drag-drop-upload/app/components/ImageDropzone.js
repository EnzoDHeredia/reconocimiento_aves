"use client";
import { useReducer, useRef, useCallback } from 'react';
import CropperArea from './CropperArea';
import { useDropzone } from 'react-dropzone';
import { getPrettyClassName, getGenero, getCroppedImg } from './utils';
import ResultPanel from './ResultPanel';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/predict';

const initialState = {
  result: null,
  loading: false,
  preview: null,
  crop: { x: 0, y: 0 },
  zoom: 1,
  croppedAreaPixels: null,
  imageLoaded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_RESULT':
      return { ...state, result: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PREVIEW':
      return { ...state, preview: action.payload };
    case 'SET_CROP':
      return { ...state, crop: action.payload };
    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };
    case 'SET_CROPPED_AREA_PIXELS':
      return { ...state, croppedAreaPixels: action.payload };
    case 'SET_IMAGE_LOADED':
      return { ...state, imageLoaded: action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export default function ImageDropzone() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const debounceRef = useRef();
  const prevPreviewRef = useRef(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    dispatch({ type: 'SET_RESULT', payload: null });
    // Limpia el objectURL anterior
    if (prevPreviewRef.current) {
      URL.revokeObjectURL(prevPreviewRef.current);
    }
    const url = URL.createObjectURL(file);
    prevPreviewRef.current = url;
    dispatch({ type: 'SET_PREVIEW', payload: url });
    dispatch({ type: 'SET_IMAGE_LOADED', payload: false });
    dispatch({ type: 'SET_ZOOM', payload: 1 });
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      'image/*': []
    }
  });

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    dispatch({ type: 'SET_CROPPED_AREA_PIXELS', payload: croppedAreaPixels });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (state.preview && croppedAreaPixels) {
        dispatch({ type: 'SET_LOADING', payload: true });
        getCroppedImg(state.preview, croppedAreaPixels, (blob) => {
          const formData = new FormData();
          formData.append('file', blob, 'cropped.jpg');
          fetch(BACKEND_URL, {
            method: 'POST',
            body: formData,
          })
            .then(res => res.json())
            .then(data => dispatch({ type: 'SET_RESULT', payload: data }))
            .catch(() => dispatch({ type: 'SET_RESULT', payload: { class: 'Error' } }))
            .finally(() => dispatch({ type: 'SET_LOADING', payload: false }));
        });
      }
    }, 600);
  }, [state.preview]);

  const handleReset = () => {
    dispatch({ type: 'RESET' });
    if (prevPreviewRef.current) {
      URL.revokeObjectURL(prevPreviewRef.current);
      prevPreviewRef.current = null;
    }
  };

  const isCentered = !state.preview;

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
          {!state.preview ? (
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
              <p className="text-3xl font-bold text-green-800 mb-2 drop-shadow">{getPrettyClassName(state.result?.class || '')}</p>
              {getGenero(state.result?.class || '') && (
                <p className="text-xl text-blue-700 mb-3 font-semibold">{getGenero(state.result?.class || '')}</p>
              )}
              <CropperArea
                preview={state.preview}
                crop={state.crop}
                zoom={state.zoom}
                setCrop={crop => dispatch({ type: 'SET_CROP', payload: crop })}
                setZoom={zoom => dispatch({ type: 'SET_ZOOM', payload: zoom })}
                onCropComplete={onCropComplete}
                setImageLoaded={loaded => dispatch({ type: 'SET_IMAGE_LOADED', payload: loaded })}
              />
              <div className="flex gap-4 items-center w-full justify-center mb-3">
                <label className="text-lg text-green-800 font-semibold">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.01}
                  value={state.zoom}
                  onChange={e => dispatch({ type: 'SET_ZOOM', payload: Number(e.target.value) })}
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
            <ResultPanel result={state.result} loading={state.loading} />
          </div>
        </div>
      )}
    </div>
  );
}
