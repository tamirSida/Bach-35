'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder: string;
}

export default function MultiSelectFilter({ 
  options, 
  selectedValues, 
  onSelectionChange, 
  placeholder 
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onSelectionChange(selectedValues.filter(v => v !== option));
    } else {
      onSelectionChange([...selectedValues, option]);
    }
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) return selectedValues[0];
    return `${selectedValues.length} נבחרו`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border border-gray-300 rounded text-right bg-white hover:border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors flex justify-between items-center"
      >
        <FontAwesomeIcon icon={faChevronDown} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        <span className={selectedValues.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
          {getDisplayText()}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-64 overflow-y-auto">
          {options.length === 0 ? (
            <div className="p-3 text-gray-500 text-center text-sm">אין אפשרויות זמינות</div>
          ) : (
            options.map(option => (
              <label
                key={option}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={() => handleToggleOption(option)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                    selectedValues.includes(option) 
                      ? 'bg-red-600 border-red-600' 
                      : 'border-gray-300'
                  }`}>
                    {selectedValues.includes(option) && (
                      <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                    )}
                  </div>
                </div>
                <span className="flex-1 text-right text-sm">{option}</span>
              </label>
            ))
          )}
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}