/**
 * AI Writing Assistant - Section 3
 * Smart auto-complete, contextual examples, and idea expansion
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, Zap, Lightbulb, Loader2, Check, X } from 'lucide-react';
import { AIWritingAssistantProps, AISuggestion } from '../types';

export const AIWritingAssistant: React.FC<AIWritingAssistantProps> = ({
  fieldName,
  value,
  onChange,
  placeholder = '',
  previousAnswers = {},
  onExpand,
  enabled = true,
  minCharactersForSuggestions = 10
}) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandedText, setExpandedText] = useState<string | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  /**
   * Generate smart suggestions based on context
   */
  const generateSuggestions = useCallback((text: string) => {
    if (!enabled || text.length < minCharactersForSuggestions) {
      setSuggestions([]);
      return;
    }

    const contextualSuggestions: AISuggestion[] = [];

    // Auto-complete suggestions based on common patterns
    if (fieldName.toLowerCase().includes('product') || fieldName.toLowerCase().includes('feature')) {
      if (text.toLowerCase().includes('dashboard') && !text.includes('for')) {
        contextualSuggestions.push({
          id: '1',
          text: text + ' for real-time team collaboration and progress tracking',
          context: 'Product description completion',
          confidence: 0.9,
          type: 'autocomplete'
        });
      }

      if (text.toLowerCase().includes('app') && text.length < 50) {
        contextualSuggestions.push({
          id: '2',
          text: text + ' with mobile-first design and offline capabilities',
          context: 'Mobile app enhancement',
          confidence: 0.85,
          type: 'autocomplete'
        });
      }
    }

    // Target users suggestions
    if (fieldName.toLowerCase().includes('user') || fieldName.toLowerCase().includes('target')) {
      if (text.toLowerCase().includes('remote') && !text.includes('who')) {
        contextualSuggestions.push({
          id: '3',
          text: text + ' who need better visibility into team activities and project status',
          context: 'Target user problem statement',
          confidence: 0.88,
          type: 'autocomplete'
        });
      }
    }

    // Features and metrics suggestions
    if (fieldName.toLowerCase().includes('feature') || fieldName.toLowerCase().includes('metric')) {
      if (text.toLowerCase().includes('real-time') || text.toLowerCase().includes('live')) {
        contextualSuggestions.push({
          id: '4',
          text: text + ', automatic notifications, and activity timeline. Success measured by 40% reduction in status meetings',
          context: 'Features and metrics completion',
          confidence: 0.82,
          type: 'autocomplete'
        });
      }
    }

    // Contextual examples based on previous answers
    const productContext = previousAnswers['product'] || previousAnswers['question1'];
    if (productContext && contextualSuggestions.length < 3) {
      contextualSuggestions.push({
        id: '5',
        text: `Building on your product idea (${productContext.substring(0, 50)}...), consider adding: `,
        context: 'Contextual example based on previous answer',
        confidence: 0.75,
        type: 'example'
      });
    }

    setSuggestions(contextualSuggestions);
    setShowSuggestions(contextualSuggestions.length > 0);
  }, [enabled, fieldName, minCharactersForSuggestions, previousAnswers]);

  /**
   * Handle text change
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    generateSuggestions(newValue);
    setExpandedText(null);
  };

  /**
   * Apply suggestion
   */
  const applySuggestion = (suggestion: AISuggestion) => {
    onChange(suggestion.text);
    setShowSuggestions(false);
    setSuggestions([]);
    setExpandedText(null);
  };

  /**
   * Expand current idea
   */
  const handleExpand = async () => {
    if (!value.trim() || !onExpand) return;

    setIsExpanding(true);
    try {
      const expanded = await onExpand(value);
      setExpandedText(expanded);
    } catch (error) {
      console.error('Failed to expand text:', error);
    } finally {
      setIsExpanding(false);
    }
  };

  /**
   * Accept expanded text
   */
  const acceptExpansion = () => {
    if (expandedText) {
      onChange(expandedText);
      setExpandedText(null);
    }
  };

  /**
   * Reject expanded text
   */
  const rejectExpansion = () => {
    setExpandedText(null);
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          applySuggestion(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  /**
   * Close suggestions when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      {/* Main textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all min-h-[120px] resize-y font-sans"
          style={{ fontSize: '16px' }}
        />

        {/* AI indicator */}
        {enabled && value.length >= minCharactersForSuggestions && (
          <div className="absolute top-2 right-2 flex items-center gap-2 bg-purple-50 text-purple-600 px-2 py-1 rounded-md text-xs">
            <Sparkles className="w-3 h-3" />
            AI Active
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          <div className="p-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Smart Suggestions (Use ↑↓ to navigate, Ctrl+Enter to apply)
          </div>

          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => applySuggestion(suggestion)}
              className={`w-full text-left p-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === selectedSuggestionIndex ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-gray-800">{suggestion.text}</div>
                  <div className="text-xs text-gray-500 mt-1">{suggestion.context}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-xs text-gray-400">
                      Confidence: {Math.round(suggestion.confidence * 100)}%
                    </div>
                    <div className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded">
                      {suggestion.type}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Expand this idea button */}
      {enabled && value.trim().length > 20 && onExpand && !expandedText && (
        <button
          onClick={handleExpand}
          disabled={isExpanding}
          className="mt-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExpanding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Expanding idea...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Expand this idea
            </>
          )}
        </button>
      )}

      {/* Expanded text preview */}
      {expandedText && (
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2 text-purple-700 font-medium">
            <Sparkles className="w-4 h-4" />
            Expanded Version
          </div>
          <div className="text-gray-800 mb-3 whitespace-pre-wrap">{expandedText}</div>
          <div className="flex gap-2">
            <button
              onClick={acceptExpansion}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm"
            >
              <Check className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={rejectExpansion}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2 text-sm"
            >
              <X className="w-4 h-4" />
              Keep original
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
