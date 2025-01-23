export function validateEmail(email: string) {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (email.length > 255) {
    return { valid: false, error: 'Email is too long' };
  }

  return { valid: true, error: null };
}

export function validatePassword(password: string) {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }

  if (password.length > 72) {
    return { valid: false, error: 'Password is too long' };
  }

  // Require at least one lowercase letter, one uppercase letter, and one number
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLowerCase || !hasUpperCase || !hasNumber) {
    return {
      valid: false,
      error: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    };
  }

  return { valid: true, error: null };
}
