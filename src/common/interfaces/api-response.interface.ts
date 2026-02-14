export type ResponseStatus =
  | 'success'
  | 'pending_code'
  | 'invalid_code'
  | 'rate_limited'
  | 'error';

export interface ApiResponse<T = any> {
  status: ResponseStatus;
  success?: boolean;
  message: string;
  data?: T;
  email?: string;
  error?: {
    code: string;
    details?: Record<string, any>;
  };
}

export interface LoginSuccessData {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    userType: string;
    profileCompleted: boolean;
    subtype?: string | null;
  };
}

export interface VerificationData {
  email: string;
  expiresIn: number;
}

export interface SendCodeResponse {
  email: string;
  expiresIn: number;
}

export interface VerifyCodeResponse {
  verified: true;
}