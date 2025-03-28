import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import Fuse from 'fuse.js';

interface AutocompleteOption {
  id?: string;
  code?: string;
  name?: string;
  description: string;
  value?: string;
  label?: string;
}

interface AutocompleteInputProps {
  options: AutocompleteOption[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  searchKeys?: string[];
  formatSelectedValue?: (option: AutocompleteOption) => string;
  onOptionSelected?: (option: AutocompleteOption) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export function AutocompleteInput({
  options,
  placeholder,
  value,
  onChange,
  disabled = false,
  className = '',
  searchKeys = ['description'],
  formatSelectedValue = (option) => option.description,
  onOptionSelected,
  onKeyDown: customKeyDownHandler
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize Fuse for fuzzy search
  const fuse = new Fuse(options, {
    keys: searchKeys,
    threshold: 0.3,
    includeScore: true,
  });

  // Filter options based on search term
  const filteredOptions = !searchTerm || searchTerm.trim() === '' 
    ? options.slice(0, 5) 
    : fuse.search(searchTerm).map(result => result.item).slice(0, 10);

  // Set search term when value changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle arrow keys for dropdown navigation when open
    if (isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        return;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredOptions.length > 0) {
          const selected = filteredOptions[selectedIndex];
          handleOptionSelect(selected);
          
          // Close the dropdown
          setIsOpen(false);
          
          // Focus input again after option selection to prepare for Enter handling by parent
          setTimeout(() => {
            inputRef.current?.focus();
            
            // If custom handler exists, call it after a short delay
            // to allow for the value to be properly updated
            if (customKeyDownHandler && value) {
              const simulatedEvent = {
                ...e,
                key: 'Enter',
                preventDefault: () => {}
              } as React.KeyboardEvent;
              
              setTimeout(() => {
                customKeyDownHandler(simulatedEvent);
              }, 50);
            }
          }, 10);
          
          return;
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        return;
      }
    }
    
    // When dropdown is closed
    if (!isOpen) {
      // If Enter is pressed with a value already set, call parent handler
      if (e.key === 'Enter' && value) {
        if (customKeyDownHandler) {
          customKeyDownHandler(e);
          return;
        }
      }
      
      // Open dropdown on arrow down or enter if it's closed and empty
      if (e.key === 'ArrowDown' || (e.key === 'Enter' && !value)) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }
    }
    
    // Allow parent components to handle Tab keys
    if (customKeyDownHandler && e.key === 'Tab') {
      customKeyDownHandler(e);
      return;
    }
    
    // Let parent handle any other keys
    if (customKeyDownHandler) {
      customKeyDownHandler(e);
    }
  };

  // Handle option selection
  const handleOptionSelect = (option: AutocompleteOption) => {
    const newValue = formatSelectedValue(option);
    onChange(newValue);
    setSearchTerm(newValue);
    setIsOpen(false);
    
    if (onOptionSelected) {
      onOptionSelected(option);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onChange(value);
    setSelectedIndex(0);
    if (value && value.trim() !== '') {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Focus the input
  const handleFocus = () => {
    setIsOpen(true);
  };

  // Clear the input
  const handleClear = () => {
    onChange('');
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative autocomplete-container">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm || ""}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`pr-8 ${className}`}
        />
        {searchTerm && searchTerm.trim() !== "" && (
          <Button 
            type="button"
            variant="ghost"
            size="icon"
            className="absolute inset-y-0 right-0 h-full w-8 p-0 flex items-center justify-center text-gray-400 hover:text-gray-600"
            onClick={handleClear}
            tabIndex={-1} // Not focusable with tab
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          <ul className="py-1 text-sm">
            {filteredOptions.map((option, index) => {
              const displayText = option.code
                ? `${option.code} - ${option.description || option.name}`
                : (option.description || option.name || '');
                
              return (
                <li 
                  key={option.id || option.code || index}
                  className={`cursor-pointer px-3 py-2 hover:bg-slate-100 flex items-center ${
                    index === selectedIndex ? 'bg-slate-100' : ''
                  }`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {index === selectedIndex && (
                    <Check className="h-4 w-4 mr-2 text-primary-600" />
                  )}
                  <span className={index === selectedIndex ? 'font-medium' : ''}>
                    {displayText}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}