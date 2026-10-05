// src/components/ui/SearchableSelect.tsx
import React from 'react';
import Select from 'react-select';

interface Option {
  value: number;
  label: string;
}

interface SearchableSelectProps {
  label: string;
  options: Option[];
  value: number | null;
  onChange: (value: number | null) => void;
  isLoading?: boolean;
  required?: boolean;
  error?: string;
  placeholder?: string;
  onInputChange?: (inputValue: string, actionMeta: { action: string }) => void;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  isLoading = false,
  required = false,
  error,
  placeholder = 'Rechercher...',
  onInputChange,
}) => {
  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Select
        options={options}
        value={selectedOption}
        onChange={(opt) => onChange(opt ? opt.value : null)}
        isLoading={isLoading}
        placeholder={placeholder}
        isClearable
        noOptionsMessage={() => 'Aucun résultat'}
        onInputChange={onInputChange}
        className="react-select-container"
        classNamePrefix="react-select"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default SearchableSelect;