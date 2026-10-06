// src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/Button';
import Input from '../components/ui/Input';
import LanguageSwitcher from '../components/LanguageSwitcher';
import logo from '../assets/logo.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { t } = useTranslation();

  // Dès que l'utilisateur est authentifié, on redirige vers le tableau de bord.
  // Filet de sécurité : même si la navigation juste après signIn échoue/lente,
  // le dashboard s'affiche sans avoir besoin d'actualiser la page.
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
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
      // Erreur retournée par le backend (ex: identifiants incorrects)
      setApiError(result.error || t('login.error'));
    }
    setIsLoading(false);
  };

  // Style de bordure rouge pour les champs en erreur
  const inputErrorClass = (hasError: boolean) =>
    hasError ? 'border-red-500 focus:ring-red-500' : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardBody className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="Logo" className="h-16 w-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{t('login.title')}</h1>
            <p className="text-gray-500 mt-1">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                label={t('login.email')}
                type="email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                placeholder="admin@example.com"
                disabled={isLoading}
                className={`w-full ${inputErrorClass(!!emailError)}`}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <div>
              <Input
                label={t('login.password')}
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="••••••••"
                disabled={isLoading}
                className={`w-full ${inputErrorClass(!!passwordError)}`}
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            {apiError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
                {apiError}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {t('login.submit')}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400">
            <p>{t('login.hint')}</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;