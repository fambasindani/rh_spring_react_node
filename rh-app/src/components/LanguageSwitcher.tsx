import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import Dropdown from './ui/Dropdown';
import { LANGUAGES, getLanguageOption } from '../i18n';

const Flag: React.FC<{ country: string; className?: string }> = ({ country, className = '' }) => (
  <span
    className={`fi fi-${country} ${className}`}
    style={{ display: 'inline-block', width: 20, height: 15, borderRadius: 2, backgroundSize: 'cover' }}
  />
);

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const current = getLanguageOption(i18n.language || 'fr');

  return (
    <Dropdown
      align="right"
      panelClassName="w-56"
      trigger={
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title={current.label}
          aria-label="Changer de langue"
        >
          <Flag country={current.country} />
          <span className="text-xs font-bold uppercase">{current.code}</span>
          <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400" />
        </button>
      }
    >
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
            current.code === lang.code
              ? 'bg-blue-50 text-blue-700 dark:bg-slate-700/60 dark:text-white'
              : 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700/60'
          }`}
        >
          <Flag country={lang.country} />
          <span className="flex-1">{lang.label}</span>
          {current.code === lang.code && <CheckIcon className="h-4 w-4 text-blue-600 dark:text-blue-300" />}
        </button>
      ))}
    </Dropdown>
  );
};

export default LanguageSwitcher;
