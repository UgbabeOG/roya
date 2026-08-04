/**
 * Input Validation Utilities for RoyaBridge Travels
 */

/**
 * Validates an email address format.
 * @param {string} email 
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required.' };
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Email address cannot be empty.' };
  }

  if (trimmed.length < 5 || trimmed.length > 254) {
    return { isValid: false, error: 'Email address must be between 5 and 254 characters.' };
  }

  // Standard RFC 5322 compliant regex for web forms
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@domain.com).' };
  }

  return { isValid: true, error: null };
}

/**
 * Validates a phone number format (supports local and international E.164 formats).
 * @param {string} phone 
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone or WhatsApp number is required.' };
  }

  const trimmed = phone.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Phone or WhatsApp number cannot be empty.' };
  }

  // Extract digits only
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (digitsOnly.length < 7) {
    return { isValid: false, error: 'Phone number must contain at least 7 digits.' };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number cannot exceed 15 digits (E.164 international standard).' };
  }

  // Valid format allows optional leading +, numbers, spaces, dashes, parentheses, dots
  const phonePattern = /^(\+?\d{1,4}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?[\d-.\s]{5,18}$/;

  if (!phonePattern.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid phone number (e.g. +1 555-234-5678).' };
  }

  return { isValid: true, error: null };
}

/**
 * Validates lead passenger full legal name.
 * @param {string} name 
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Full legal name is required.' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Full legal name must be at least 2 characters.' };
  }

  if (!/^[a-zA-Z\s'\-.]+$/.test(trimmed)) {
    return { isValid: false, error: 'Full legal name should only contain letters, spaces, hyphens, and apostrophes.' };
  }

  return { isValid: true, error: null };
}
