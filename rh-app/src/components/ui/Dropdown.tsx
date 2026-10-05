import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  panelClassName?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, children, align = 'left', panelClassName = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 min-w-[12rem] rounded-xl bg-white dark:bg-slate-800 shadow-xl shadow-slate-900/10 ring-1 ring-black/5 dark:ring-white/10 focus:outline-none overflow-hidden ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${panelClassName}`}
        >
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <button
    className={`block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700/60 hover:text-gray-900 dark:hover:text-white transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Dropdown;
