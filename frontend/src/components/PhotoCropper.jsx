import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useDispatch } from 'react-redux';
import { setCustomization } from '../features/participantSlice';
import getCroppedImg from '../utils/cropImage';
import { Check } from 'lucide-react';

export default function PhotoCropper({ imageSrc, onComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const dispatch = useDispatch();

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      dispatch(setCustomization({ croppedPhoto: croppedImage }));
      if (onComplete) onComplete();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full h-[300px] bg-black/30 rounded-xl overflow-hidden border-2 border-[var(--color-goa-green)]">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </div>
      
      <div className="flex items-center gap-4 px-2">
        <span className="text-[var(--color-sand)] text-xs font-mono">ZOOM</span>
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(e.target.value)}
          className="w-full accent-[var(--color-sun-gold)]"
        />
      </div>

      <button
        onClick={handleCropImage}
        className="btn-hh bg-[var(--color-sun-gold)] text-black hover:bg-white font-bold w-full py-3 rounded uppercase tracking-widest flex items-center justify-center gap-2"
      >
        <Check size={18} /> Apply Photo
      </button>
    </div>
  );
}
