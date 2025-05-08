import Cropper from 'react-easy-crop';

export default function CropperArea({ preview, crop, zoom, setCrop, setZoom, onCropComplete, setImageLoaded }) {
  return (
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
  );
}
