// src/components/SearchableSelect.tsx
import React from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { useTheme } from '../contexts/ThemeContext';

interface Option {
  value: number;
  label: string;
}

interface SearchableSelectProps {
  label?: string;
  options?: Option[];
  loadOptions?: (inputValue: string) => Promise<Option[]>;
  value: number | null;
  onChange: (value: number | null) => void;
  isLoading?: boolean;
  required?: boolean;
  error?: string;
  placeholder?: string;
  onInputChange?: (inputValue: string, actionMeta: { action: string }) => void;
  containerClassName?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options = [],
  loadOptions,
  value,
  onChange,
  isLoading = false,
  required = false,
  error,
  placeholder = 'Rechercher...',
  onInputChange,
  containerClassName = 'mb-4',
}) => {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const selectedOption = options.find(opt => opt.value === value) || null;

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: dark ? '#1e293b' : '#ffffff',
      borderColor: dark ? '#334155' : base.borderColor,
    }),
    singleValue: (base: any) => ({ ...base, color: dark ? '#e2e8f0' : '#111827' }),
    input: (base: any) => ({ ...base, color: dark ? '#e2e8f0' : '#111827' }),
    placeholder: (base: any) => ({ ...base, color: dark ? '#64748b' : '#9ca3af' }),
    menu: (base: any) => ({ ...base, backgroundColor: dark ? '#1e293b' : '#ffffff' }),
    menuList: (base: any) => ({ ...base, backgroundColor: dark ? '#1e293b' : '#ffffff' }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? (dark ? '#334155' : '#eff6ff') : (dark ? '#1e293b' : '#ffffff'),
      color: dark ? '#e2e8f0' : '#111827',
      cursor: 'pointer',
    }),
    noOptionsMessage: (base: any) => ({ ...base, color: dark ? '#94a3b8' : '#6b7280' }),
  };

  const commonProps = {
    placeholder,
    isClearable: true,
    noOptionsMessage: () => 'Aucun résultat',
    styles: selectStyles,
    className: 'react-select-container',
    classNamePrefix: 'react-select',
  };

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {loadOptions ? (
        <AsyncSelect
          {...commonProps}
          cacheOptions
          defaultOptions
          loadOptions={loadOptions as any}
          value={selectedOption}
          onChange={(opt: any) => onChange(opt ? opt.value : null)}
          isLoading={isLoading}
        />
      ) : (
        <Select
          {...commonProps}
          options={options}
          value={selectedOption}
          onChange={(opt) => onChange(opt ? opt.value : null)}
          isLoading={isLoading}
          onInputChange={onInputChange}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default SearchableSelect;
