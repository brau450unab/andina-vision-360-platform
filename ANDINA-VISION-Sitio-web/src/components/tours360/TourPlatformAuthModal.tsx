import React, { useState } from 'react';
import { Lock, User, Sliders, ArrowRight, X, ShieldCheck } from 'lucide-react';

interface TourPlatformAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: 'client' | 'admin') => void;
}

export const TourPlatformAuthModal: React.FC<TourPlatformAuthModalProps> = ({
  isOpen, onClose, onSelectRole
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4">
      {/* Outer bezel shell */}
      <div
        className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{
          padding: '6px',
          borderRadius: '2.5rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.02)',
        }}
      >
        {/* Inner bezel core */}
        <div
          className="relative flex flex-col p-8 sm:p-10"
          style={{
            borderRadius: 'calc(2.5rem - 6px)',
            background: 'linear-gradient(160deg, rgba(14,20,32,0.95) 0%, rgba(8,11,18,0.98) 100%)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)',
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:rotate-90"
          >
            <X size={18} />
          </button>

          <div className="text-center mb-8">
            <div
              className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-6"
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.25)',
                boxShadow: '0 8px 32px rgba(16,185,129,0.15)',
              }}
            >
              <Lock size={24} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-display font-black uppercase text-white tracking-wide">
              Acceso a la Plataforma
            </h2>
            <p className="text-xs text-white/40 font-mono mt-3 max-w-[280px] mx-auto leading-relaxed">
              Selecciona tu perfil de acceso para explorar la biblioteca o comenzar la edición inmersiva.
            </p>
          </div>

          <div className="space-y-4">
            {/* Opción 1: Cliente */}
            <button
              onClick={() => { onSelectRole('client'); onClose(); }}
              className="group w-full p-4 flex items-center gap-4 text-left transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{
                borderRadius: '1.25rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Cliente / Propietario
                </h3>
                <p className="text-[10px] text-white/40 font-mono mt-1">
                  Ver la biblioteca de imágenes en 360°, inspeccionar detalles en 8K y probar giroscopio.
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20 group-hover:translate-x-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <ArrowRight size={14} className="text-white/50 group-hover:text-cyan-400" />
              </div>
            </button>

            {/* Opción 2: Creador Pro */}
            <button
              onClick={() => { onSelectRole('admin'); onClose(); }}
              className="group w-full p-4 flex items-center gap-4 text-left transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{
                borderRadius: '1.25rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <Sliders size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Creador & Editor Pro
                </h3>
                <p className="text-[10px] text-white/40 font-mono mt-1">
                  Crear y editar tours, colocar hotspots, usar IA de Vertex y exportar código embed.
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 group-hover:translate-x-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <ArrowRight size={14} className="text-white/50 group-hover:text-emerald-400" />
              </div>
            </button>
          </div>

          <div
            className="mt-8 pt-6 flex items-center justify-center gap-2 text-[10px] font-mono text-white/30"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <ShieldCheck size={12} className="text-emerald-500/60" />
            <span>Autenticación GCP Firestore</span>
          </div>
        </div>
      </div>
    </div>
  );
};