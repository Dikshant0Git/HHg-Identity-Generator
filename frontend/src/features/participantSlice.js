import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createParticipantWithPhoto, getPublicProfile as getPublicProfileAPI, previewBuilderClass as previewBuilderClassAPI } from '../services/api';

/**
 * Helper: Convert a base64 data URL to a Blob
 */
const dataURLtoBlob = (dataURL) => {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bstr = atob(parts[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Async thunk: create participant via multipart/form-data
 * Sends photo file + all fields to backend
 */
export const submitParticipant = createAsyncThunk(
  'participant/submit',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState().participant;
      const { formData, customization } = state;

      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('email', formData.email.trim());

      // Stack as JSON array string — backend validator handles both
      if (formData.stack && formData.stack.length > 0) {
        formData.stack.forEach((tech) => fd.append('stack', tech));
      }

      // Social fields as a stringified JSON object
      if (formData.social) {
        fd.append('social', JSON.stringify(formData.social));
      }

      // Cropped photo as file blob
      if (customization.croppedPhoto) {
        const photoBlob = dataURLtoBlob(customization.croppedPhoto);
        fd.append('photo', photoBlob, 'profile-photo.png');
      }

      const response = await createParticipantWithPhoto(fd);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Async thunk: fetch public profile by publicId
 */
export const fetchPublicProfile = createAsyncThunk(
  'participant/fetchProfile',
  async (publicId, { rejectWithValue }) => {
    try {
      const response = await getPublicProfileAPI(publicId);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Async thunk: preview builder class from stack
 */
export const fetchBuilderClassPreview = createAsyncThunk(
  'participant/fetchBuilderClass',
  async (stack, { rejectWithValue }) => {
    try {
      const response = await previewBuilderClassAPI(stack);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  // Form data — mirrors backend Zod validator fields
  formData: {
    email: '',
    name: '',
    role: '',
    photoUrl: '',
    stack: [],
    social: {
      xHandle: '',
      github: '',
      linkedin: '',
      bio: '',
    },
  },
  
  // UI Customization fields (frontend only)
  customization: {
    theme: 1,
    accentColor: '#var(--color-sun-gold)',
    showQuote: true,
    croppedPhoto: null,
  },

  // Uploaded photo (local state before upload to CDN)
  uploadedPhoto: {
    file: null,
    preview: null, // local blob URL
    uploading: false,
    error: null,
  },

  // Participant data returned from backend
  participant: null,
  created: null,     // true = new, false = existing
  existing: null,

  // Builder class preview (from backend)
  builderClassPreview: null,

  // Card generation state
  cardGeneration: {
    generating: false,
    imageDataUrl: null,
    error: null,
  },

  // Current step in creation flow (1-4)
  currentStep: 1,

  // API state
  loading: false,
  error: null,

  // Profile fetch state (separate from creation)
  profileLoading: false,
  profileError: null,
  profileData: null,
};

const participantSlice = createSlice({
  name: 'participant',
  initialState,
  reducers: {
    // Update form data fields
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        state.formData[parent][child] = value;
      } else {
        state.formData[field] = value;
      }
    },

    // Set stack array
    setStack: (state, action) => {
      state.formData.stack = action.payload;
    },

    // Photo upload management
    setPhotoPreview: (state, action) => {
      state.uploadedPhoto.preview = action.payload;
    },
    setPhotoUploading: (state, action) => {
      state.uploadedPhoto.uploading = action.payload;
    },
    setPhotoUrl: (state, action) => {
      state.formData.photoUrl = action.payload;
      state.uploadedPhoto.uploading = false;
      state.uploadedPhoto.error = null;
    },
    setPhotoError: (state, action) => {
      state.uploadedPhoto.error = action.payload;
      state.uploadedPhoto.uploading = false;
    },

    // Customization fields
    setCustomization: (state, action) => {
      state.customization = { ...state.customization, ...action.payload };
    },

    // Step navigation
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      if (state.currentStep < 4) state.currentStep += 1;
    },
    prevStep: (state) => {
      if (state.currentStep > 1) state.currentStep -= 1;
    },

    // Builder class preview
    setBuilderClassPreview: (state, action) => {
      state.builderClassPreview = action.payload;
    },

    // Card generation
    setCardGenerating: (state, action) => {
      state.cardGeneration.generating = action.payload;
    },
    setCardImage: (state, action) => {
      state.cardGeneration.imageDataUrl = action.payload;
      state.cardGeneration.generating = false;
    },
    setCardError: (state, action) => {
      state.cardGeneration.error = action.payload;
      state.cardGeneration.generating = false;
    },

    // Reset entire state
    resetParticipant: () => initialState,

    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // Submit participant
    builder
      .addCase(submitParticipant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitParticipant.fulfilled, (state, action) => {
        state.loading = false;
        state.participant = action.payload.participant;
        state.created = action.payload.created;
        state.existing = action.payload.existing || false;
        // Store builder class from backend response
        if (action.payload.participant?.builderClass) {
          state.builderClassPreview = action.payload.participant.builderClass;
        }
      })
      .addCase(submitParticipant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { code: 'UNKNOWN', message: 'Submission failed' };
      });

    // Fetch public profile
    builder
      .addCase(fetchPublicProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchPublicProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profileData = action.payload.participant;
      })
      .addCase(fetchPublicProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload || { code: 'UNKNOWN', message: 'Profile fetch failed' };
      });

    // Builder class preview
    builder
      .addCase(fetchBuilderClassPreview.pending, () => {})
      .addCase(fetchBuilderClassPreview.fulfilled, (state, action) => {
        state.builderClassPreview = action.payload.builderClass;
      })
      .addCase(fetchBuilderClassPreview.rejected, () => {});
  },
});

export const {
  updateFormField, setStack, setPhotoPreview, setPhotoUploading,
  setPhotoUrl, setPhotoError, setCustomization, setCurrentStep, nextStep, prevStep,
  setBuilderClassPreview, setCardGenerating, setCardImage, setCardError,
  resetParticipant, clearError,
} = participantSlice.actions;

export default participantSlice.reducer;
