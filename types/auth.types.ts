export interface LoginFormData {
  congregation: string;
  email: string;
  password: string;
}

export interface LoginFormProps {
  onLogin: (data: LoginFormData) => Promise<void>;
}

export interface RegisterFormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  congregation_id?: number;
  roles: string[];
}
