export interface InputFieldProps {
  label: string;
  type?: "text" | "password" | "email" | "number";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: string;
  showToggle?: boolean;
}
