import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainAgencySite } from './MainAgencySite';
import { TourPlatformHub } from './components/tours360/TourPlatformHub';
import { SiteProvider } from './context/SiteContext';
import { TourSaaSProvider } from './context/TourSaaSContext';

function App() {
  return (
    <BrowserRouter>
      <SiteProvider>
        <Routes>
          {/* Landing Page (Agencia) */}
          <Route path="/" element={<MainAgencySite />} />
          
          {/* Plataforma 360 Independiente */}
          <Route path="/plataforma/*" element={
            <TourSaaSProvider>
              <TourPlatformHub />
            </TourSaaSProvider>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SiteProvider>
    </BrowserRouter>
  );
}

export default App;