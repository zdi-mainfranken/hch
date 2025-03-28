import React, { useState, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { TherapeuticMeasureItem } from '@/lib/medicalData';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

interface TherapeuticTagsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  availableMeasures: TherapeuticMeasureItem[];
  getDiagnosisBasedSuggestions?: () => string[];
  className?: string;
  onKeyDown?: (e: KeyboardEvent) => void;
}

const TherapeuticTagsInput: React.FC<TherapeuticTagsInputProps> = ({
  value,
  onChange,
  availableMeasures,
  getDiagnosisBasedSuggestions,
  className,
  onKeyDown
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Function to handle adding a tag
  const addTag = (tag: string) => {
    if (tag && tag.trim() !== "" && !value.includes(tag)) {
      const newTags = [...value, tag];
      onChange(newTags);
      setInputValue("");
      updateSuggestions("");
    }
  };
  
  // Function to handle removing a tag
  const removeTag = (index: number) => {
    const newTags = [...value];
    newTags.splice(index, 1);
    onChange(newTags);
  };
  
  // Function to update suggestions based on input
  const updateSuggestions = (input: string) => {
    if (!input || input.trim() === '') {
      // Show diagnosis-based suggestions when field is empty
      if (getDiagnosisBasedSuggestions) {
        const diagnosisSuggestions = getDiagnosisBasedSuggestions()
          .filter(suggestion => !value.includes(suggestion));
        setSuggestions(diagnosisSuggestions);
      } else {
        setSuggestions([]);
      }
      return;
    }
    
    // Filter suggestions based on input
    const filteredSuggestions = availableMeasures
      .filter(measure => 
        measure.name.toLowerCase().includes(input.toLowerCase()) || 
        measure.description.toLowerCase().includes(input.toLowerCase())
      )
      .map(measure => measure.name)
      .filter(name => !value.includes(name))
      .slice(0, 5); // Limit to 5 suggestions
    
    setSuggestions(filteredSuggestions);
  };
  
  // Show diagnosis-based suggestions on mount
  useEffect(() => {
    if (getDiagnosisBasedSuggestions) {
      const diagnosisSuggestions = getDiagnosisBasedSuggestions()
        .filter(suggestion => !value.includes(suggestion));
      setSuggestions(diagnosisSuggestions);
    }
  }, []);
  
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
              updateSuggestions(e.target.value);
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
            placeholder="Add therapeutic measure..."
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
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, i) => (
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

export { TherapeuticTagsInput };