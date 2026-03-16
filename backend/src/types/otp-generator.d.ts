declare module 'otp-generator' {
  export interface GenerateOptions {
    digits?: boolean;
    upperCaseAlphabets?: boolean;
    lowerCaseAlphabets?: boolean;
    specialChars?: boolean;
  }

  export function generate(length: number, options?: GenerateOptions): string;

  const otpGenerator: {
    generate: typeof generate;
  };

  export default otpGenerator;
}
