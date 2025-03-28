// NOTE: This component is deprecated and will be removed in a future update.
// Please use the AutocompleteInput component instead, which provides more consistent behavior.

import React, { useState, KeyboardEvent } from 'react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { cn } from '@/lib/utils';

interface SimpleTagsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: KeyboardEvent) => void;
  suggestions?: string[];
}

const SimpleTagsInput = ({
  value,
  onChange,
  placeholder = "Add tag...",
  className,
  onKeyDown,
  suggestions = []
}: SimpleTagsInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Function to handle adding a tag
  const addTag = (tag: string) => {
    if (tag && tag.trim() !== "" && !value.includes(tag)) {
      const newTags = [...value, tag];
      onChange(newTags);
      setInputValue("");
    }
  };
  
  // Function to handle removing a tag
  const removeTag = (index: number) => {
    const newTags = [...value];
    newTags.splice(index, 1);
    onChange(newTags);
  };
  
  // Filter suggestions based on input and current tags
  const filteredSuggestions = suggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) && 
      !value.includes(suggestion)
    )
    .slice(0, 5); // Limit to 5 suggestions
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, index) => (
          <Badge key={index} variant="outline" className="bg-primary-50 text-primary-700 border-primary-100">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 text-primary-400 hover:text-primary-700 focus:outline-none"
              tabIndex={-1} // Not focusable with tab
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      
      <div className="relative">
        <div className="flex">
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Delay hiding suggestions to allow clicking on them
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue) {
                e.preventDefault();
                addTag(inputValue);
              } else if (e.key === ',' && inputValue) {
                e.preventDefault();
                addTag(inputValue.replace(',', ''));
              } else if (onKeyDown) {
                onKeyDown(e);
              }
            }}
            placeholder={placeholder}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => {
              if (inputValue) addTag(inputValue);
            }}
            className="ml-1 px-2 py-2 bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredSuggestions.map((suggestion, i) => (
              <div
                key={i}
                className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur
                  addTag(suggestion);
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="text-xs text-slate-500 mt-1">
        Press Enter, comma, or the + button to add a tag
      </div>
    </div>
  );
};

export { SimpleTagsInput };