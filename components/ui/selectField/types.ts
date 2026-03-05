export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps {
  label: string;
  value: string | string[];
  placeholder?: string;
  onChange: (value: any) => void;
  options: SelectOption[];
  disabled?: boolean;
  multiple?: boolean;
}
