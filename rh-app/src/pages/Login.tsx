// src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import LanguageSwitcher from '../components/LanguageSwitcher';
import logo from '../assets/logo.png';
import {
  FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaArrowLeft,
  FaShieldAlt, FaIdCard, FaUsers, FaFingerprint, FaCheckCircle,
} from 'react-icons/fa';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'login' | 'forgot'>('login');

  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const validateFields = (): boolean => {
    let isValid = true;
    if (!email.trim()) {
      setEmailError(t('login.emailRequired'));
      isValid = false;
    } else {
      setEmailError('');
    }
    if (!password.trim()) {
      setPasswordError(t('login.passwordRequired'));
      isValid = false;
    } else {
      setPasswordError('');
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validateFields()) return;

    setIsLoading(true);
    const result = await signIn(email, password);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setApiError(result.error || t('login.error'));
    }
    setIsLoading(false);
  };

  const inputClass = (hasError: boolean) =>
    `w-full pl-11 pr-4 h-12 rounded-lg border text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
      hasError
        ? 'border-red-400 focus:ring-red-400'
        : 'border-gray-200 focus:border-blue-600 focus:ring-blue-500/30'
    }`;

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="w-full h-screen flex flex-col lg:flex-row">
        {/* ───────── Panneau gauche (marque) ───────── */}
        <div className="hidden lg:flex lg:w-1/2 h-full bg-gradient-to-b from-[#1E3A8A] to-[#081b33] p-10 xl:p-16 flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white !bg-white p-1.5 flex items-center justify-center shadow-lg ring-1 ring-black/5 overflow-hidden">
              <img src={logo} alt="DGRAD" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-none">GS-RH</h1>
              <p className="text-blue-300 text-xs mt-1">Ressources Humaines</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-white leading-tight">Gestion des<br />Ressources Humaines</h2>
              <p className="text-blue-200/80 mt-3 text-base max-w-md">
                Plateforme centralisée de gestion du personnel, du pointage et des cartes professionnelles de la DGRAD.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <FaUsers className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-base font-medium text-white">Agents &amp; Carrière</p>
                  <p className="text-blue-300 text-sm">Dossiers, grades, fonctions et directions</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <FaFingerprint className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-base font-medium text-white">Présences &amp; Pointage</p>
                  <p className="text-blue-300 text-sm">Suivi en temps réel et pointage mobile</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <FaIdCard className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-base font-medium text-white">Cartes professionnelles</p>
                  <p className="text-blue-300 text-sm">Demandes, réception et validation RH</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-blue-400/80 text-sm border-t border-blue-700/50 pt-4">
              République Démocratique du Congo · Kinshasa
            </p>
          </div>
        </div>

        {/* ───────── Panneau droit (formulaire) ───────── */}
        <div className="w-full lg:w-1/2 h-full bg-[#dae2ec] dark:bg-slate-950 p-6 md:p-12 flex flex-col justify-center items-center relative">
          <div className="absolute top-4 right-4 z-10">
            <LanguageSwitcher />
          </div>

          {/* Logo mobile */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white !bg-white p-1.5 flex items-center justify-center shadow ring-1 ring-black/5 overflow-hidden">
              <img src={logo} alt="DGRAD" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-none">GS-RH</h1>
              <p className="text-gray-500 text-xs mt-1">Ressources Humaines</p>
            </div>
          </div>

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-10">
            {view === 'login' ? (
              <>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900">{t('login.title')}</h2>
                  <p className="text-gray-500 text-sm mt-1">{t('login.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('login.email')}</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="email"
                        name="email"
                        autoComplete="username"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                        placeholder="admin@example.com"
                        disabled={isLoading}
                        className={inputClass(!!emailError)}
                      />
                    </div>
                    {emailError && <p className="mt-1.5 text-sm text-red-500">{emailError}</p>}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-gray-700">{t('login.password')}</label>
                      <button
                        type="button"
                        onClick={() => setView('forgot')}
                        className="text-sm text-blue-700 hover:text-blue-800 hover:underline transition-colors"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(''); }}
                        placeholder="••••••••"
                        disabled={isLoading}
                        className={`${inputClass(!!passwordError)} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {passwordError && <p className="mt-1.5 text-sm text-red-500">{passwordError}</p>}
                  </div>

                  {apiError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{apiError}</div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    disabled={isLoading}
                    className="w-full h-12 rounded-full text-base justify-center inline-flex items-center group"
                  >
                    {!isLoading && <span>{t('login.submit')}</span>}
                    {!isLoading && <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />}
                  </Button>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <FaShieldAlt className="text-gray-400 text-xs" />
                    <p className="text-xs text-gray-400">{t('login.hint')}</p>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                    <FaEnvelope className="w-6 h-6 text-blue-700" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    Pour réinitialiser votre mot de passe, veuillez contacter l'administrateur
                    de la Direction des Ressources Humaines.
                  </p>
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <FaCheckCircle className="mt-0.5 flex-shrink-0" />
                  <span>Votre mot de passe sera réinitialisé et communiqué par l'administrateur.</span>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-full bg-[#1E3A8A] hover:bg-[#172e6b] text-white text-base font-medium transition-colors"
                  >
                    <FaArrowLeft className="w-4 h-4" />
                    Retour à la connexion
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="lg:hidden text-center mt-6">
            <p className="text-xs text-gray-400">République Démocratique du Congo · Kinshasa</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
