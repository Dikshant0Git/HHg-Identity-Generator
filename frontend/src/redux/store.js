import { configureStore } from '@reduxjs/toolkit';
import participantReducer from '../features/participantSlice';

export const store = configureStore({
  reducer: {
    participant: participantReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore file objects in uploadedPhoto
        ignoredPaths: ['participant.uploadedPhoto.file'],
        ignoredActions: ['participant/setPhotoPreview'],
      },
    }),
});
