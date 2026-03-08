/**
 * Utility functions for working with CSS variables
 */

/**
 * Get the computed value of a CSS variable
 * @param variableName - The CSS variable name (e.g., '--color-primary')
 * @returns The computed value of the CSS variable
 */
export const getCSSVariableValue = (variableName: string): string => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
};

/**
 * Get multiple CSS variable values at once
 * @param variableNames - Array of CSS variable names
 * @returns Object with variable names as keys and their computed values
 */
export const getCSSVariableValues = (
  variableNames: string[]
): Record<string, string> => {
  const result: Record<string, string> = {};
  variableNames.forEach((varName) => {
    result[varName] = getCSSVariableValue(varName);
  });
  return result;
};

/**
 * Get a CSS variable value with a fallback default
 * @param variableName - The CSS variable name
 * @param defaultValue - The default value if variable is not found or empty
 * @returns The CSS variable value or default value
 */
export const getCSSVariableValueWithDefault = (
  variableName: string,
  defaultValue: string
): string => {
  const value = getCSSVariableValue(variableName);
  return value || defaultValue;
};
