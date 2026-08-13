import React, { useRef, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Download, RefreshCcw, Loader2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import { usePageReveal } from '../hooks/useGsapAnimations';
import { fetchPublicProfile } from '../features/participantSlice';
import { BUILDER_CLASSES } from '../utils/constants';
import hhLogo from '../assets/hh-logo.png';
import homeHeroArt from '../assets/home-hero-art.png';

export default function Preview() {
  const { publicId } = useParams();
  const dispatch = useDispatch();
  const pageRef = useRef(null);
  const cardRef = useRef(null);
  usePageReveal(pageRef);

  const { profileData, profileLoading, profileError, formData, uploadedPhoto } = useSelector((state) => state.participant);
  const [downloading, setDownloading] = useState(false);

  // Decide whether to use Redux formData (if just created) or fetched profileData
  const isNewlyCreated = formData?.name && uploadedPhoto?.preview && publicId;
  
  useEffect(() => {
    if (!isNewlyCreated && publicId) {
      dispatch(fetchPublicProfile(publicId));
    }
  }, [dispatch, publicId, isNewlyCreated]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: null,
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `HH_Goa_2026_${publicId}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Failed to download card. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    const text = encodeURIComponent(`Just forged my HH Goa 2026 Builder ID 🌴\n\n#FrameInGoa\n`);
    const url = encodeURIComponent(`${window.location.origin}/id/${publicId}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  // Determine data source
  const data = isNewlyCreated ? {
    ...formData,
    photoUrl: uploadedPhoto.preview,
    builderClass: { name: 'CODE NOMAD', code: 'N-01' }, // Fallback mock if needed
  } : profileData;

  const builderClassInfo = data?.builderClass ? BUILDER_CLASSES[data.builderClass.name] : BUILDER_CLASSES['CODE NOMAD'];
  const profileUrl = `${window.location.origin}/id/${publicId}`;

  return (
    <div ref={pageRef} className="section-hh min-h-screen py-12 flex flex-col items-center">
      <div className="max-w-4xl w-full mx-auto px-4 text-center">
        
        <p className="text-mono-label text-[var(--color-sun-gold)] mb-4 uppercase">
          Preview Your ID
        </p>
        <h1 className="heading-section text-3xl md:text-4xl text-[var(--color-cream)] mb-8">
          BUILDER ID: <span className="text-[var(--color-hh-pink)]">{publicId}</span>
        </h1>

        {profileLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--color-sun-gold)]">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className="font-mono">Locating Builder Record...</p>
          </div>
        ) : profileError && !isNewlyCreated ? (
          <div className="p-6 bg-red-900/50 border border-red-500 rounded-lg max-w-md mx-auto text-red-200">
            <h3 className="font-bold mb-2">Error Loading Profile</h3>
            <p className="font-mono text-sm">{profileError.message || 'Builder ID not found or server error.'}</p>
            <Link to="/create" className="btn-hh btn-hh-outline mt-4 inline-block text-sm">
              Create New ID
            </Link>
          </div>
        ) : data ? (
          <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-8 lg:gap-16">
            
            {/* The ID Card Container */}
            <div className="relative shrink-0 perspective-1000">
              <div 
                ref={cardRef}
                className="w-[320px] sm:w-[380px] bg-[var(--color-sand)] rounded-2xl overflow-hidden relative shadow-[8px_8px_0_0_var(--color-ink-black)] border-4 border-[var(--color-ink-black)]"
                style={{ aspectRatio: '3/4' }}
              >
                {/* Background Banner */}
                <div className="absolute top-0 left-0 w-full h-[45%] opacity-90 overflow-hidden">
                  <img src={homeHeroArt} alt="Banner" className="w-full h-full object-cover object-top mix-blend-multiply" crossOrigin="anonymous" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-sand)]" />
                </div>

                <div className="relative z-10 w-full h-full flex flex-col items-center p-6 pt-8">
                  {/* Header Branding */}
                  <img src={hhLogo} alt="HH Goa" className="h-10 mb-6 drop-shadow-md" crossOrigin="anonymous" />

                  {/* Photo Profile */}
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-ink-black)] shadow-[4px_4px_0_0_var(--color-ink-black)] bg-[var(--color-goa-green-dark)]">
                      <img 
                        src={data.photoUrl} 
                        alt={data.name} 
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                    {/* Class Badge */}
                    <div 
                      className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full border-2 border-[var(--color-ink-black)] flex items-center justify-center text-lg shadow-[2px_2px_0_0_var(--color-ink-black)]"
                      style={{ backgroundColor: builderClassInfo?.color || 'var(--color-sun-gold)' }}
                    >
                      {builderClassInfo?.emoji || '🛠'}
                    </div>
                  </div>

                  {/* Info */}
                  <h2 className="font-display font-black text-2xl uppercase tracking-tight text-[var(--color-goa-green-deep)] text-center leading-none mt-2">
                    {data.name}
                  </h2>
                  <p className="font-mono text-[10px] font-bold text-[var(--color-hh-pink)] uppercase tracking-widest mt-2">
                    {data.builderClass?.name || 'CODE NOMAD'}
                  </p>

                  <div className="flex flex-wrap justify-center gap-1 mt-3 max-w-[80%]">
                    {data.stack.slice(0, 4).map(s => (
                      <span key={s} className="px-2 py-0.5 bg-[var(--color-goa-green)] text-[var(--color-cream)] text-[8px] font-mono font-bold uppercase rounded-full">
                        {s}
                      </span>
                    ))}
                    {data.stack.length > 4 && (
                      <span className="px-2 py-0.5 bg-[var(--color-goa-green)] text-[var(--color-cream)] text-[8px] font-mono font-bold uppercase rounded-full">
                        +{data.stack.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Footer of Card */}
                  <div className="mt-auto w-full flex items-end justify-between border-t-2 border-[var(--color-ink-black)] pt-4">
                    <div className="flex flex-col">
                      <p className="font-mono text-[8px] text-[var(--color-goa-green-dark)] uppercase">BUILDER ID</p>
                      <p className="font-mono text-sm font-bold text-[var(--color-ink-black)]">{publicId}</p>
                    </div>
                    
                    {/* QR Code */}
                    <div className="bg-white p-1 rounded shadow-sm border border-[var(--color-ink-black)]">
                      <QRCode 
                        value={profileUrl} 
                        size={48} 
                        bgColor="#FFFFFF" 
                        fgColor="#1A1A1A" 
                        level="L"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 w-full md:w-auto mt-8 md:mt-0 max-w-xs">
              <button 
                onClick={handleDownload}
                disabled={downloading}
                className="btn-hh btn-hh-primary w-full flex items-center justify-center gap-2"
              >
                {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                DOWNLOAD ID
              </button>
              
              <button 
                onClick={handleShare}
                className="btn-hh btn-hh-secondary w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 border-black"
              >
                <svg width="18" height="18" viewBox="0 0 1200 1227" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/></svg>
                SHARE TO X
              </button>

              <Link 
                to="/create" 
                className="btn-hh btn-hh-outline w-full flex items-center justify-center gap-2 text-sm mt-4"
              >
                <RefreshCcw size={16} />
                START OVER
              </Link>
            </div>
            
          </div>
        ) : null}

      </div>
    </div>
  );
}
