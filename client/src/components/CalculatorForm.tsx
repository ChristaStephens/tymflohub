import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CalculatorFormProps {
  fields: Array<{
    name: string;
    label: string;
    placeholder: string;
    prefix?: string;
  }>;
  onCalculate: (values: Record<string, number>) => void;
  isLoading?: boolean;
}

export default function CalculatorForm({ fields, onCalculate, isLoading }: CalculatorFormProps) {
  const [values, setValues] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValues = Object.entries(values).reduce(
      (acc, [key, value]) => ({ ...acc, [key]: parseFloat(value) || 0 }),
      {}
    );
    onCalculate(numericValues);
  };

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name} className="text-sm font-medium">
            {field.label}
          </Label>
          <div className="relative">
            {field.prefix && (
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                {field.prefix}
              </span>
            )}
            <Input
              id={field.name}
              type="number"
              step="0.01"
              placeholder={field.placeholder}
              value={values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`${field.prefix ? "pl-7" : ""} text-right font-mono`}
              data-testid={`input-${field.name}`}
            />
          </div>
        </div>
      ))}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isLoading}
        data-testid="button-calculate"
      >
        {isLoading ? "Calculating..." : "Calculate"}
      </Button>
    </form>
  );
}
