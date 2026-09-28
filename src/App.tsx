import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TourSaaSProvider } from './context/TourSaaSContext';
import { TourPlatformHub } from './components/tours360/TourPlatformHub';

export default function App() {
  return (
    <TourSaaSProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<TourPlatformHub initialTab="landing" standaloneMode={true} />}
          />
          <Route
            path="/login"
            element={<TourPlatformHub initialTab="landing" standaloneMode={true} />}
          />
          <Route
            path="/dashboard"
            element={<TourPlatformHub initialTab="dashboard" standaloneMode={true} />}
          />
          <Route
            path="/mis-tours"
            element={<TourPlatformHub initialTab="mis-tours" standaloneMode={true} />}
          />
          <Route
            path="/biblioteca"
            element={<TourPlatformHub initialTab="biblioteca" standaloneMode={true} />}
          />
          <Route
            path="/editor"
            element={<TourPlatformHub initialTab="editor" standaloneMode={true} />}
          />
          <Route
            path="/planes"
            element={<TourPlatformHub initialTab="planes" standaloneMode={true} />}
          />
          <Route
            path="/plataforma/*"
            element={<TourPlatformHub initialTab="landing" standaloneMode={true} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TourSaaSProvider>
  );
}
