export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
}
