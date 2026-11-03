import { LIMITS } from '../domain/limits'
import { MIN_YEAR, type CarDetailsError, type CarDetailsInput } from '../domain/carDetails'

const maxLengths: Partial<Record<keyof CarDetailsInput, number>> = {
  make: LIMITS.make,
  model: LIMITS.model,
  licensePlate: LIMITS.licensePlate,
}

export function carDetailsErrorMessage(
  field: keyof CarDetailsInput,
  error: CarDetailsError,
  now: Date,
): string {
  switch (error) {
    case 'required':
      return 'שדה חובה'
    case 'tooLong':
      return `אפשר להזין עד ${maxLengths[field]} תווים`
    case 'invalid':
      return 'יש להזין ספרות בלבד'
    case 'outOfRange':
      return `יש להזין שנה בין ${MIN_YEAR} ל־${now.getFullYear() + 1}`
  }
}
