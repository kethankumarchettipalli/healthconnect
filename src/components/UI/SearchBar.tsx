import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void; // ⬅️ removed location param
  onFilterToggle: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  onFilterToggle,
  placeholder = "Search doctors, specialties, or symptoms..."
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const mockSuggestions = [
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'General Physician',
    'Orthopedics',
    'Gynecology',
    'Chest pain',
    'Neurology',
    'General medicine',
    'Skin problems',
    'Back pain'
  ];

  useEffect(() => {
    if (query.length > 0) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query); // ⬅️ only pass query
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion); // ⬅️ only pass suggestion
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="block w-full pl-10 pr-3 py-4 border-0 placeholder-gray-500 focus:ring-0 focus:outline-none text-gray-900"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex border-t md:border-t-0 md:border-l border-gray-200">
            <button
              type="button"
              onClick={onFilterToggle}
              className="px-4 py-4 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-5 w-5" />
            </button>
            <button
              type="submit"
              className="px-6 py-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{suggestion}</span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
