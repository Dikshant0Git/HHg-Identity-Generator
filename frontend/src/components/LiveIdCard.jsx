import React from 'react';
import { useSelector } from 'react-redux';
import idCardThemes from '../assets/id-card-themes.png';

export default function LiveIdCard({ idCardRef }) {
  const { formData, customization, builderClassPreview } = useSelector((state) => state.participant);
  
  const { name, stack, social, role: customRole } = formData;
  const { theme, accentColor, croppedPhoto } = customization;

  const role = customRole || (stack.length > 0 ? stack[0] : "DEVOPS ENGINEER");
  const builderClass = builderClassPreview?.name || "CODE NOMAD";
  const quote = social.bio || "I SHIP CODE. NOT EXCUSES.";

  return (
    <div 
      ref={idCardRef}
      className="relative w-full max-w-[320px] lg:max-w-[380px] mx-auto aspect-[58/92] rounded-[16px] md:rounded-[24px] overflow-hidden shadow-2xl group bg-white"
    >
      {/* Background Theme Sprite */}
      <div 
        className="absolute inset-0 w-full h-full bg-no-repeat"
        style={{
           backgroundImage: `url(${idCardThemes})`,
           backgroundSize: '400% 100%',
           backgroundPosition: `${(theme - 1) * 33.333}% 0%`
        }}
      />

      {/* Name and Role (Above Photo) */}
      <div className="absolute top-[32%] left-[6%] w-[90%] flex flex-col items-center rounded z-20 py-1 px-4 bg-[#0F3725]/70 text-center">
        <h1 className="font-display font-black text-2xl md:text-[26px] text-[#FFFFFF] uppercase tracking-wider leading-none drop-shadow-md">
          {name || "YOUR NAME"}
        </h1>
        <h2 className="font-display font-bold text-xs md:text-sm text-[#ffffff] uppercase tracking-wide mt-1 drop-shadow-sm">
          {role}
        </h2>
      </div>

      {/* Profile Photo Overlay (Positioned exactly over the circle) */}
      <div className="absolute top-[42%] left-[50%] -translate-x-1/2 w-[47%] aspect-square rounded-full overflow-hidden z-20" style={{ borderColor: accentColor }}>
        {croppedPhoto ? (
          <img src={croppedPhoto} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#0F3725] font-mono text-[10px] text-center leading-tight">NO PHOTO</span>
          </div>
        )}
      </div>

      {/* Quote (Below Photo) */}
      <div className="absolute top-[72%] left-[12%] w-[280px] px-6 text-center z-20">
        <p className="font-mono font-bold text-xs md:text-sm text-[#0F3725] uppercase tracking-wide leading-tight drop-shadow-sm">
          {quote}
        </p>
      </div>

      {/* Builder Class Pill (Bottom) */}
      <div className="absolute bottom-[18%] w-full flex justify-center z-20">
        <div 
          className="px-4 md:px-6 py-1 md:py-1.5 rounded-full text-white font-mono font-bold text-[10px] md:text-xs tracking-widest uppercase shadow-md"
          style={{ backgroundColor: accentColor !== '#var(--color-sun-gold)' ? accentColor : '#A50044' }}
        >
          {builderClass}
        </div>
      </div>
    </div>
  );
}
