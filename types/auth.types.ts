export interface LoginFormData {
  congregation: string;
  email: string;
  password: string;
}

export interface LoginFormProps {
  onLogin: (data: LoginFormData) => void;
}
