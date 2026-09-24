import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Sliders, 
  ArrowRight, 
  X, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

interface TourPlatformAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: 'client' | 'admin') => void;
}

export const TourPlatformAuthModal: React.FC<TourPlatformAuthModalProps> = ({
  isOpen,
  onClose,
  onSelectRole
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 text-white relative shadow-2xl animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
            <Lock size={22} />
          </div>
          <h2 className="text-xl font-display font-black uppercase text-white tracking-wide">
            Acceso a la Plataforma 360°
          </h2>
          <p className="text-xs text-slate-400 font-light mt-1.5">
            Selecciona tu perfil de acceso para explorar la biblioteca o comenzar la edición del tour virtual.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => {
              onSelectRole('client');
              onClose();
            }}
            className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all flex items-center gap-4 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                Acceso Cliente / Propietario
              </h3>
              <p className="text-[11px] text-slate-400 font-light">
                Ver la biblioteca de imágenes en 360°, inspeccionar detalles en 8K y probar giroscopio.
              </p>
            </div>
            <ArrowRight size={16} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => {
              onSelectRole('admin');
              onClose();
            }}
            className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all flex items-center gap-4 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
              <Sliders size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                Acceso Creador & Editor
              </h3>
              <p className="text-[11px] text-slate-400 font-light">
                Crear y editar tours virtuales, colocar hotspots en la esfera, usar IA de Vertex y exportar embed.
              </p>
            </div>
            <ArrowRight size={16} className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] font-mono text-slate-500">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Google Cloud Run & Firestore Autenticado</span>
        </div>
      </div>
    </div>
  );
};
