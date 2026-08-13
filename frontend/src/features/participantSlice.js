import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createParticipant as createParticipantAPI, getPublicProfile as getPublicProfileAPI } from '../services/api';

// Async thunk: create or retrieve participant
export const submitParticipant = createAsyncThunk(
  'participant/submit',
  async (participantData, { rejectWithValue }) => {
    try {
      const response = await createParticipantAPI(participantData);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Async thunk: fetch public profile by publicId
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

const initialState = {
  // Form data — mirrors backend Zod validator fields
  formData: {
    email: '',
    name: '',
    photoUrl: '',
    stack: [],
    social: {
      xHandle: '',
      github: '',
      linkedin: '',
      bio: '',
    },
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

  // Builder class preview
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
  },
});

export const {
  updateFormField, setStack, setPhotoPreview, setPhotoUploading,
  setPhotoUrl, setPhotoError, setCurrentStep, nextStep, prevStep,
  setBuilderClassPreview, setCardGenerating, setCardImage, setCardError,
  resetParticipant, clearError,
} = participantSlice.actions;

export default participantSlice.reducer;
