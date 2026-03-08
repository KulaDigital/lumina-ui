import { useState } from "react";

const DEFAULT_SUGGESTIONS = [
  "What services do you provide?",
  "What are your pricing details?",
  "How can I contact support?",
  "Tell me about your company",
];

interface StarterSuggestionsProps {
  value: string[];
  onChange: (suggestions: string[]) => void;
  label?: string;
}

export default function StarterSuggestions({
  value,
  onChange,
  label = "Starter Suggestions",
}: StarterSuggestionsProps) {
  const [customInput, setCustomInput] = useState("");

  const toggleSuggestion = (suggestion: string) => {
    if (value.includes(suggestion)) {
      onChange(value.filter((s) => s !== suggestion));
    } else {
      onChange([...value, suggestion]);
    }
  };

  const addCustomSuggestion = () => {
    const trimmed = customInput.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setCustomInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomSuggestion();
    }
  };

  const removeSuggestion = (suggestion: string) => {
    onChange(value.filter((s) => s !== suggestion));
  };

  // Separate selected into default vs custom for display
  const customSelected = value.filter((s) => !DEFAULT_SUGGESTIONS.includes(s));

  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">
        {label}
      </label>
      <p className="text-xs text-text-secondary mb-3">
        Select common suggestions or add your own. These appear as quick-start
        options in the chat widget.
      </p>

      {/* Default suggestion chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {DEFAULT_SUGGESTIONS.map((suggestion) => {
          const isSelected = value.includes(suggestion);
          return (
            <button
              key={suggestion}
              type="button"
              onClick={() => toggleSuggestion(suggestion)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                isSelected
                  ? "shadow-sm"
                  : "bg-white text-text-secondary border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor: "var(--color-primary-light)",
                      color: "var(--color-primary)",
                      borderColor: "var(--color-primary)",
                    }
                  : undefined
              }
            >
              {isSelected && (
                <span className="mr-1">✓</span>
              )}
              {suggestion}
            </button>
          );
        })}
      </div>

      {/* Custom input */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a custom suggestion..."
          className="flex-1 border border-[var(--color-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        />
        <button
          type="button"
          onClick={addCustomSuggestion}
          disabled={!customInput.trim()}
          className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Add
        </button>
      </div>

      {/* Custom selected tags (removable) */}
      {customSelected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customSelected.map((suggestion) => (
            <span
              key={suggestion}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: "var(--color-primary-light)",
                color: "var(--color-primary)",
                borderColor: "var(--color-primary)",
              }}
            >
              {suggestion}
              <button
                type="button"
                onClick={() => removeSuggestion(suggestion)}
                className="ml-0.5 transition-opacity hover:opacity-70"
                style={{ color: "var(--color-primary)" }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Selected count summary */}
      {value.length > 0 && (
        <p className="text-xs text-text-secondary mt-2">
          {value.length} suggestion{value.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}
