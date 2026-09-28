import React, { useState } from 'react';
import {
  X, Mail, Lock, User, ArrowRight, Compass, CheckCircle2,
  Building2, ShieldCheck, Sparkles, TrendingUp
} from 'lucide-react';
import { useTourSaaS } from '../../context/TourSaaSContext';

interface TourPlatformAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TourPlatformAuthModal: React.FC<TourPlatformAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { login, register, loginWithGoogle } = useTourSaaS();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [companyType, setCompanyType] = useState('Inmobiliaria / Corredora');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Por favor ingresa tu nombre o razón social.');
          setLoading(false);
          return;
        }
        await register(`${name} (${companyType})`, email, password);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al autenticar. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión con Google Workspace.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAccess = async () => {
    setError('');
    setLoading(true);
    try {
      await login('ejecutivo@andinavision360.cl', 'demo2026');
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      setError('No se pudo iniciar la sesión demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="Cerrar ventana de acceso"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="md:col-span-5 p-8 bg-gradient-to-br from-sky-50 via-slate-50 to-emerald-50/50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-sky-600" />
              Andina 360° • Portal Comercial
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 leading-tight mb-3">
              Plataforma B2B de Comercialización Espacial
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed mb-6">
              Gestione salas de ventas virtuales 24/7, publique recorridos 360° en 8K HDR y acelere el cierre de contratos inmobiliarios, turísticos e industriales.
            </p>

            <div className="space-y-3.5 mb-6">
              {[
                'Salas de venta virtuales listas para Portal Inmobiliario y Web',
                'Editor espacial de Hotspots, fichas técnicas UF/CLP y planos 2D',
                'Suite integrada Photopea PSD y Magnific AI 8K Super-Resolution',
                'Enlaces comerciales con botón directo a WhatsApp Ejecutivo'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-200/80">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Acceso Evaluador B2B
                </span>
                <span className="text-[10px] font-semibold text-slate-400">1-Clic</span>
              </div>
              <p className="text-[11px] text-slate-600 mb-3">
                Explora el Centro de Control, la Biblioteca 360° y el Editor Photopea con una cuenta ejecutiva preconfigurada:
              </p>
              <button
                type="button"
                onClick={handleQuickDemoAccess}
                disabled={loading}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ingresar con Cuenta Demo Corporativa
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> Google Cloud SSL
              </span>
              <span>SLA Empresarial 99.9%</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 p-8 md:p-10 bg-white flex flex-col justify-center">
          <div className="flex gap-1.5 mb-6 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-sky-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-sky-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Crear Cuenta Comercial
            </button>
          </div>

          <div className="mb-5">
            <h4 className="text-xl font-bold text-slate-900">
              {mode === 'login'
                ? 'Acceso a su Escritorio Comercial 360°'
                : 'Registro de Cuenta Comercial Gratuita'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'login'
                ? 'Ingrese con sus credenciales corporativas o cuenta de Google Workspace.'
                : 'Active su entorno de comercialización 360° en menos de 60 segundos.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 mb-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold rounded-xl transition-all flex items-center justify-center gap-3 text-sm shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            Continuar con Google Workspace
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Nombre o Empresa
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Inmobiliaria Pacífico"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Rubro Comercial
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-600 focus:bg-white transition-colors"
                    >
                      <option value="Inmobiliaria / Corredora">Inmobiliaria / Corredora</option>
                      <option value="Constructora / ITO">Constructora / ITO</option>
                      <option value="Hotelería / Turismo">Hotelería / Turismo</option>
                      <option value="Arquitectura / Retail">Arquitectura / Retail</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Correo Electrónico Corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contacto@suempresa.cl"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Contraseña de Acceso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md shadow-sky-600/15 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? 'Validando credenciales...'
                : mode === 'login'
                ? 'Ingresar a Plataforma 360°'
                : 'Crear Cuenta Comercial y Abrir Studio'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
