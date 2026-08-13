import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Check, ChevronRight, Loader2, Upload } from 'lucide-react';
import {
  updateFormField,
  setStack,
  setPhotoPreview,
  setPhotoUploading,
  setPhotoUrl,
  setCustomization,
  nextStep,
  prevStep,
  submitParticipant,
} from '../features/participantSlice';
import { usePageReveal } from '../hooks/useGsapAnimations';
import { STACK_SUGGESTIONS } from '../utils/constants';
import * as htmlToImage from 'html-to-image';
import { shareCardToX, getXAuthUrl } from '../services/api';

import PhotoCropper from '../components/PhotoCropper';
import LiveIdCard from '../components/LiveIdCard';
import bgWithoutFooter from '../assets/background-without-footer.png';
import mobileBackground from '../assets/mobile-background.png';
import idCardThemes from '../assets/id-card-themes.png';

import theme1 from '../assets/theme-1.png';
import theme2 from '../assets/theme-2.png';
import theme3 from '../assets/theme-3.png';
import theme4 from '../assets/theme-4.png';
const THEME_IMAGES = [theme1, theme2, theme3, theme4];

const ACCENT_COLORS = ['#388E3C', '#E91E63', '#FBC02D', '#FFECB3', '#009688'];

const PRESET_QUOTES = [
  "I SHIP CODE. NOT EXCUSES. 😎",
  "CODE. SUN. CHAOS. REPEAT.",
  "WE SHIP DREAMS, NOT JUST CODE.",
  "GOOD CODE. BETTER VIBES. BEST CREW."
];

export default function Create() {
  const pageRef = useRef(null);
  const idCardRef = useRef(null);
  usePageReveal(pageRef);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { formData, uploadedPhoto, customization, currentStep, loading, error, participant } = useSelector((state) => state.participant);
  
  const [forging, setForging] = useState(false);
  const [stackInput, setStackInput] = useState('');
  const [xAuthed, setXAuthed] = useState(false);
  const [xSharing, setXSharing] = useState(false);
  const [xShared, setXShared] = useState(false);
  const [xError, setXError] = useState(null);

  // Detect X OAuth callback params on mount
  useEffect(() => {
    const xAuth = searchParams.get('x_auth');
    const xErr = searchParams.get('x_error');
    if (xAuth === 'success') {
      setXAuthed(true);
      // Clean up URL params
      searchParams.delete('x_auth');
      setSearchParams(searchParams, { replace: true });
    }
    if (xErr) {
      setXError(`X authentication failed: ${xErr}`);
      searchParams.delete('x_error');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFormField({ field: name, value }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      dispatch(setPhotoPreview(previewUrl));
      // Reset cropped photo when new one is selected
      dispatch(setCustomization({ croppedPhoto: null }));
    }
  };

  const addStackTag = (tag) => {
    if (formData.stack.length < 8 && !formData.stack.includes(tag)) {
      dispatch(setStack([...formData.stack, tag]));
    }
    setStackInput('');
  };
  
  const removeStackTag = (tagToRemove) => {
    dispatch(setStack(formData.stack.filter(tag => tag !== tagToRemove)));
  };

  const handleStackKeyDown = (e) => {
    if (e.key === 'Enter' && stackInput.trim()) {
      e.preventDefault();
      addStackTag(stackInput.trim());
    }
  };

  const handleDownload = async () => {
    if (!idCardRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(idCardRef.current, {
        pixelRatio: 2, // High resolution
        backgroundColor: '#FFFFFF',
      });
      const link = document.createElement('a');
      link.download = `HH_Goa_BuilderID_${(formData.name || 'Builder').replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download image:", err);
      alert(`Download failed: ${err.message || 'Canvas error'}`);
    }
  };

  const handleSubmit = async () => {
    setForging(true);
    try {
      // submitParticipant thunk reads state internally and builds FormData with the cropped photo
      const resultAction = await dispatch(submitParticipant());
      
      setTimeout(() => {
        setForging(false);
        if (submitParticipant.fulfilled.match(resultAction)) {
          dispatch(nextStep()); // Move to step 4 on success
        }
      }, 1500);
    } catch (err) {
      setForging(false);
    }
  };

  const handleShareToX = async () => {
    if (!idCardRef.current) return;
    
    // If not authed with X, redirect to OAuth
    if (!xAuthed) {
      try {
        const response = await getXAuthUrl();
        if (response?.authUrl) {
          window.location.href = response.authUrl;
        }
      } catch (err) {
        setXError('Failed to connect to X. Please try again.');
      }
      return;
    }

    // Already authed — capture card and share
    setXSharing(true);
    setXError(null);
    try {
      const blob = await htmlToImage.toBlob(idCardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
      });
      
      const response = await shareCardToX(blob);
      
      setXShared(true);
      setXSharing(false);
      
      // Open the post URL if returned
      if (response?.postUrl) {
        window.open(response.postUrl, '_blank');
      }
    } catch (err) {
      setXSharing(false);
      setXError(err?.message || 'Failed to share to X. Please try again.');
    }
  };

  const renderDetailsStep = () => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <label className="block text-mono-label text-[var(--color-sun-gold)] mb-2">FULL NAME</label>
        <input 
          type="text" name="name" value={formData.name} onChange={handleChange}
          placeholder="John Doe"
          className="w-full bg-transparent border-b-2 border-[var(--color-sand-dark)] focus:border-[var(--color-hh-pink)] text-xl font-body text-[var(--color-cream)] py-2 outline-none transition-colors"
          required
        />
      </div>
      <div>
        <label className="block text-mono-label text-[var(--color-sun-gold)] mb-2">EMAIL ADDRESS</label>
        <input 
          type="email" name="email" value={formData.email} onChange={handleChange}
          placeholder="john@example.com"
          className="w-full bg-transparent border-b-2 border-[var(--color-sand-dark)] focus:border-[var(--color-hh-pink)] text-xl font-body text-[var(--color-cream)] py-2 outline-none transition-colors"
          required
        />
      </div>
      <div>
        <label className="block text-mono-label text-[var(--color-sun-gold)] mb-2">CUSTOM ROLE</label>
        <div className="relative">
          <input 
            type="text" name="role" value={formData.role || ''} onChange={handleChange}
            placeholder="e.g. DEVOPS ENGINEER" maxLength={15}
            className="w-full bg-transparent border-b-2 border-[var(--color-sand-dark)] focus:border-[var(--color-hh-pink)] text-xl font-body text-[var(--color-cream)] py-2 pr-12 outline-none transition-colors uppercase"
          />
          <span className="absolute right-2 top-3 text-[var(--color-sand-dark)] text-xs font-mono">{(formData.role || '').length}/15</span>
        </div>
      </div>
      <div>
        <label className="block text-mono-label text-[var(--color-sun-gold)] mb-2">YOUR TECH STACK (MAX 8)</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.stack.map(tag => (
            <span key={tag} className="badge-hh-green flex items-center gap-1 text-sm">
              {tag} <button onClick={() => removeStackTag(tag)} className="hover:text-[var(--color-hh-pink)] ml-1">×</button>
            </span>
          ))}
        </div>
        <input 
          type="text" value={stackInput} onChange={(e) => setStackInput(e.target.value)} onKeyDown={handleStackKeyDown}
          placeholder="Type and press Enter (e.g. React, Python)"
          className="w-full bg-transparent border-b-2 border-[var(--color-sand-dark)] focus:border-[var(--color-hh-pink)] font-body text-[var(--color-cream)] py-2 outline-none transition-colors mb-3"
          disabled={formData.stack.length >= 8}
        />
        <div className="flex flex-wrap gap-2">
          {STACK_SUGGESTIONS.filter(s => !formData.stack.includes(s)).slice(0, 8).map(suggestion => (
            <button 
              key={suggestion} onClick={() => addStackTag(suggestion)}
              className="text-xs font-mono border border-[var(--color-sand-dark)] text-[var(--color-sand)] hover:border-[var(--color-sun-gold)] hover:text-[var(--color-sun-gold)] px-2 py-1 rounded transition-colors"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-mono-label text-[var(--color-sun-gold)] mb-2">X HANDLE</label>
            <input type="text" name="social.xHandle" value={formData.social.xHandle} onChange={handleChange} placeholder="@handle" className="w-full bg-transparent border-b-2 border-[var(--color-sand-dark)] focus:border-[var(--color-hh-pink)] font-body text-[var(--color-cream)] py-2 outline-none" />
        </div>
        <div>
            <label className="block text-mono-label text-[var(--color-sun-gold)] mb-2">GITHUB</label>
            <input type="text" name="social.github" value={formData.social.github} onChange={handleChange} placeholder="username" className="w-full bg-transparent border-b-2 border-[var(--color-sand-dark)] focus:border-[var(--color-hh-pink)] font-body text-[var(--color-cream)] py-2 outline-none" />
        </div>
      </div>
    </div>
  );

  const renderPhotoStep = () => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!uploadedPhoto.preview ? (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--color-sand-dark)] hover:border-[var(--color-sun-gold)] transition-colors rounded-xl bg-[var(--color-goa-green-dark)] relative cursor-pointer">
          <input 
            type="file" accept="image/jpeg, image/png, image/heic" onChange={handlePhotoSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="w-16 h-16 rounded-full bg-[var(--color-goa-green)] flex items-center justify-center mb-4 text-[var(--color-sun-gold)]">
            <Upload size={24} />
          </div>
          <p className="font-display font-semibold text-lg text-[var(--color-cream)] mb-1">Upload Photo</p>
          <p className="text-mono-small text-[var(--color-sand)]">Drag & drop or click to browse</p>
        </div>
      ) : !customization.croppedPhoto ? (
        <PhotoCropper imageSrc={uploadedPhoto.preview} />
      ) : (
        <div className="flex flex-col items-center gap-4">
           <div className="w-40 h-40 rounded-full border-4 border-[var(--color-sun-gold)] shadow-xl overflow-hidden">
               <img src={customization.croppedPhoto} alt="Cropped" className="w-full h-full object-cover" />
           </div>
           <p className="text-mono-small text-[var(--color-goa-green)] flex items-center gap-1 bg-[var(--color-sand)] px-3 py-1 rounded-full">
             <Check size={14} /> Photo Applied
           </p>
           <button onClick={() => dispatch(setCustomization({ croppedPhoto: null }))} className="text-[var(--color-hh-pink)] text-xs font-bold uppercase tracking-widest hover:underline">
               Retake/Adjust Crop
           </button>
        </div>
      )}
    </div>
  );

  const renderCustomizeStep = () => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <label className="block text-mono-label text-[var(--color-sun-gold)] mb-3">CHOOSE THEME</label>
        <div className="grid grid-cols-4 gap-2">
           {[1, 2, 3, 4].map((themeIdx) => (
               <button 
                  key={themeIdx} 
                  onClick={() => dispatch(setCustomization({ theme: themeIdx }))}
                  className={`relative aspect-[58/92] rounded overflow-hidden border-2 transition-all ${customization.theme === themeIdx ? 'border-[var(--color-hh-pink)] ring-2 ring-[var(--color-hh-pink)]' : 'border-[var(--color-goa-green-dark)] hover:border-[var(--color-sun-gold)]'}`}
               >
                   <div 
                     className="w-full h-full bg-no-repeat"
                     style={{
                        backgroundImage: `url(${idCardThemes})`,
                        backgroundSize: '400% 100%',
                        backgroundPosition: `${(themeIdx - 1) * 33.333}% 0%`
                     }}
                   />
                   {customization.theme === themeIdx && (
                       <div className="absolute top-1 right-1 bg-[var(--color-hh-pink)] rounded-full p-0.5 text-white shadow"><Check size={12}/></div>
                   )}
               </button>
           ))}
        </div>
      </div>

      <div>
        <label className="block text-mono-label text-[var(--color-sun-gold)] mb-4">ACCENT COLOR</label>
        <div className="flex gap-4">
            {ACCENT_COLORS.map(color => (
                <button 
                  key={color} 
                  onClick={() => dispatch(setCustomization({ accentColor: color }))}
                  className={`w-10 h-10 rounded-full border-2 transition-all shadow-md flex items-center justify-center ${customization.accentColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                >
                    {customization.accentColor === color && <Check size={16} className="text-white drop-shadow-md" />}
                </button>
            ))}
        </div>
      </div>

      <div>
          <label className="block text-mono-label text-[var(--color-sun-gold)] mb-2">QUOTE</label>
          <div className="relative mb-2">
              <input 
                type="text" name="social.bio" value={formData.social.bio} onChange={handleChange}
                placeholder="I SHIP CODE. NOT EXCUSES." maxLength={40}
                className="w-full bg-black/20 border border-[var(--color-sand-dark)] focus:border-[var(--color-hh-pink)] p-2 pr-12 text-sm font-body text-[var(--color-cream)] outline-none rounded"
              />
              <span className="absolute right-2 top-2 text-[var(--color-sand-dark)] text-[10px] font-mono">{formData.social.bio.length}/40</span>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
             {PRESET_QUOTES.map((q, idx) => (
                <button 
                  key={idx} 
                  onClick={() => dispatch(updateFormField({ field: 'social.bio', value: q }))}
                  className="text-left text-[10px] font-mono text-[var(--color-sand)] hover:text-[var(--color-sun-gold)] bg-black/10 hover:bg-black/20 px-2 py-1 rounded transition-colors"
                >
                  {q}
                </button>
             ))}
          </div>
      </div>
    </div>
  );

  const canProceed = () => {
    if (currentStep === 1) return formData.name.trim() && formData.email.trim() && formData.stack.length > 0;
    if (currentStep === 2) return !!customization.croppedPhoto;
    return true;
  };

  if (forging) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-[var(--color-goa-green-deep)]">
        <div className="w-24 h-24 mb-8 relative animate-spin-slow">
          <div className="absolute inset-0 rounded-full border-4 border-t-[var(--color-hh-pink)] border-r-[var(--color-sun-gold)] border-b-[var(--color-goa-green)] border-l-[var(--color-sand)]" />
        </div>
        <h2 className="heading-section text-2xl md:text-4xl text-[var(--color-cream)] animate-pulse">
          FORGING YOUR BUILDER ID...
        </h2>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="min-h-screen lg:h-screen relative pt-24 lg:pt-20 pb-12 lg:pb-4 overflow-x-hidden lg:overflow-hidden bg-[var(--color-goa-green-deep)] flex flex-col justify-center">
      {/* Background layer */}
      <div className="absolute inset-0 w-full h-full opacity-30 pointer-events-none mix-blend-overlay">
         <img src={bgWithoutFooter} className="w-full h-full object-cover hidden lg:block" />
         <img src={mobileBackground} className="w-full h-full object-fill block lg:hidden" />
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-4 lg:px-8 relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-12 items-center">
        
        {/* Left Column: Steps Navigation */}
        <div className="lg:w-[220px] shrink-0 hidden lg:flex flex-col">
          <h2 className="text-[var(--color-sun-gold)] font-display font-black text-2xl md:text-3xl leading-tight mb-6">
            CREATE YOUR<br/>
            <span className="text-[var(--color-cream)]">BUILDER ID</span>
          </h2>
          
          <div className="flex flex-col gap-6">
            <p className="text-[var(--color-hh-pink)] font-mono text-sm tracking-widest mb-2">Step {currentStep} of 4</p>
            {[ 
              { num: 1, title: '1. DETAILS' },
              { num: 2, title: '2. PHOTO' },
              { num: 3, title: '3. CUSTOMIZE' },
              { num: 4, title: '4. PREVIEW & DOWNLOAD' }
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <div key={step.num} className={`flex items-center gap-4 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono font-bold shrink-0 transition-colors
                    ${isActive || isPast ? 'border-[var(--color-sun-gold)] text-[var(--color-sun-gold)] bg-transparent' : 
                      'border-[var(--color-sand-dark)] text-[var(--color-sand-dark)]'}`}
                  >
                    {isPast || (isActive && step.num === 4) ? <Check size={16} /> : <span className="w-2 h-2 rounded-full bg-[var(--color-sun-gold)]" style={{opacity: isActive ? 1 : 0}}></span>}
                  </div>
                  <h3 className={`font-display font-bold tracking-wide text-lg ${isActive ? 'text-[var(--color-cream)]' : 'text-[var(--color-sand)]'}`}>
                    {step.title}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: Form Elements */}
        <div className="lg:w-[420px] shrink-0 w-full max-w-md">
          <div className="bg-[var(--color-goa-green-dark)]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 md:p-6 min-h-[590px] lg:h-[460px] flex flex-col shadow-2xl relative">
              
              {/* Header */}
              <h3 className="text-lg font-display text-[var(--color-sun-gold)] uppercase tracking-wider font-bold mb-4 text-center shrink-0">
                  {currentStep === 1 && "Enter Your Details"}
                  {currentStep === 2 && "Upload Your Photo"}
                  {currentStep === 3 && "Customize Your Card"}
                  {currentStep === 4 && "Ready to Forge"}
              </h3>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto pr-1 pb-4 flex flex-col justify-start">
                  {currentStep === 1 && renderDetailsStep()}
                  {currentStep === 2 && renderPhotoStep()}
                  {currentStep === 3 && renderCustomizeStep()}
                  {currentStep === 4 && (
                      <div className="text-center text-[var(--color-cream)] flex flex-col items-center justify-center h-full gap-3">
                          <Check size={48} className="text-[var(--color-goa-green)] mb-2" />
                          <h4 className="text-2xl font-display font-bold text-white mb-1">FORGED SUCCESSFULLY!</h4>
                          {participant?.publicId && (
                            <p className="text-xs font-mono text-[var(--color-sun-gold)] mb-1">ID: {participant.publicId}</p>
                          )}
                          <p className="mb-4 text-sm text-[var(--color-sand)]">Your ID Card is ready. Download or share it!</p>
                          <button 
                              onClick={handleDownload}
                              className="px-8 py-3 rounded font-mono text-sm font-bold tracking-widest bg-[var(--color-hh-pink)] text-white hover:bg-[var(--color-hh-pink-hot)] shadow-md transition-all flex items-center gap-2"
                          >
                              DOWNLOAD IMAGE
                          </button>
                          <button 
                              onClick={handleShareToX}
                              disabled={xSharing || xShared}
                              className="px-8 py-3 rounded font-mono text-sm font-bold tracking-widest bg-black text-white hover:bg-gray-800 shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                              {xSharing ? (
                                <><Loader2 size={14} className="animate-spin" /> SHARING...</>
                              ) : xShared ? (
                                <><Check size={14} /> SHARED!</>
                              ) : (
                                <><svg width="14" height="14" viewBox="0 0 1200 1227" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/></svg> SHARE TO X</>
                              )}
                          </button>
                          {xError && <p className="text-xs text-red-400 font-mono mt-1">{xError}</p>}
                      </div>
                  )}
              </div>

              {error && (
                <div className="mb-2 p-2 bg-red-500/20 border border-red-500/50 text-red-200 text-xs font-mono rounded shrink-0">
                  Error: {error.message || 'Something went wrong'}
                </div>
              )}

              {/* Footer Buttons */}
              {currentStep < 4 && (
                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto shrink-0">
                    <button 
                        onClick={() => dispatch(prevStep())}
                        disabled={currentStep === 1}
                        className={`px-4 py-1.5 rounded font-mono text-xs tracking-widest border border-[var(--color-sun-gold)] text-[var(--color-sun-gold)] hover:bg-[var(--color-sun-gold)]/10 transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                        BACK
                    </button>
                    
                    {currentStep < 3 ? (
                        <button 
                            onClick={() => dispatch(nextStep())}
                            disabled={!canProceed()}
                            className="px-6 py-1.5 rounded font-mono text-xs font-bold tracking-widest bg-[var(--color-hh-pink)] text-white hover:bg-[var(--color-hh-pink-hot)] shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            NEXT
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit}
                            disabled={!canProceed() || loading}
                            className="px-6 py-1.5 rounded font-mono text-xs font-bold tracking-widest bg-[var(--color-hh-pink)] text-white hover:bg-[var(--color-hh-pink-hot)] shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : 'FORGE ID'}
                        </button>
                    )}
                </div>
              )}
          </div>
        </div>

        {/* Right Column: Live ID Card Preview */}
        <div className="flex-1 flex justify-center items-center lg:pl-6 w-full py-8 lg:py-0">
           <div className="w-full flex flex-col items-center drop-shadow-2xl">
              <LiveIdCard idCardRef={idCardRef} />
           </div>
        </div>

      </div>
    </div>
  );
}
