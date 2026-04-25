// Utility functions for validation
export const validators = {
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  phone: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
  },

  cpf: (cpf) => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return false;

    // Check if all digits are the same
    if (/^(\d)\1+$/.test(cleaned)) return false;

    // Validate CPF algorithm
    const digits = cleaned.split('').map(Number);
    const calcDigit = (factor) => {
      let sum = 0;
      for (let i = 0; i < factor - 1; i++) {
        sum += digits[i] * (factor - i);
      }
      const remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    const digit1 = calcDigit(10);
    const digit2 = calcDigit(11);

    return digit1 === digits[9] && digit2 === digits[10];
  },

  required: (value) => {
    return value !== null && value !== undefined && String(value).trim() !== '';
  },

  minLength: (value, min) => {
    return String(value).length >= min;
  },

  maxLength: (value, max) => {
    return String(value).length <= max;
  },

  numeric: (value) => {
    return !isNaN(value) && !isNaN(parseFloat(value));
  },

  positive: (value) => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  },
};