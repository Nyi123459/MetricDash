export interface RegisterUserInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface ResendVerificationInput {
  email: string;
}

export interface GoogleSignInInput {
  idToken: string;
}
