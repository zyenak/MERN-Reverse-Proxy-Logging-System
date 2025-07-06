import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { FormField as FormFieldType } from '@/types';

interface FormFieldProps {
  field: FormFieldType;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
  className,
}) => {
  const handleChange = (newValue: any) => {
    if (field.validation) {
      // Basic validation
      if (field.validation.min && typeof newValue === 'number' && newValue < field.validation.min) {
        return;
      }
      if (field.validation.max && typeof newValue === 'number' && newValue > field.validation.max) {
        return;
      }
      if (field.validation.pattern && typeof newValue === 'string' && !field.validation.pattern.test(newValue)) {
        return;
      }
    }
    onChange(newValue);
  };

  const renderInput = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <Input
            id={field.name}
            type={field.type}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={cn(error && 'border-red-500')}
          />
        );

      case 'number':
        return (
          <Input
            id={field.name}
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(Number(e.target.value))}
            placeholder={field.placeholder}
            disabled={disabled}
            min={field.validation?.min}
            max={field.validation?.max}
            className={cn(error && 'border-red-500')}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.name}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={cn(error && 'border-red-500')}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger className={cn(error && 'border-red-500')}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'switch':
        return (
          <Switch
            id={field.name}
            checked={Boolean(value)}
            onCheckedChange={handleChange}
            disabled={disabled}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={field.name} className={cn(error && 'text-red-500')}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {renderInput()}
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      {field.validation?.message && !error && (
        <p className="text-sm text-muted-foreground">{field.validation.message}</p>
      )}
    </div>
  );
};

// Form wrapper component
interface FormProps {
  fields: FormFieldType[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  className?: string;
}

export const Form: React.FC<FormProps> = ({
  fields,
  values,
  onChange,
  errors = {},
  disabled = false,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {fields.map((field) => (
        <FormField
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={(value) => onChange(field.name, value)}
          error={errors[field.name]}
          disabled={disabled}
        />
      ))}
    </div>
  );
}; 