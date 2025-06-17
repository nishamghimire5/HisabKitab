/**
 * Utility functions for currency formatting
 */

/**
 * Format amount in Nepali Rupees
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return `Rs. ${amount.toFixed(2)}`;
};

/**
 * Get currency symbol
 * @returns The currency symbol
 */
export const getCurrencySymbol = (): string => {
  return 'Rs.';
};

/**
 * Get currency name
 * @returns The currency name
 */
export const getCurrencyName = (): string => {
  return 'Nepali Rupees';
};

/**
 * Get currency code
 * @returns The currency code
 */
export const getCurrencyCode = (): string => {
  return 'NPR';
};
