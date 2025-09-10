import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ViabilityFormData } from './types';
import {
  PRODUCT_TYPE_OPTIONS,
  DEVELOPMENT_COST_RANGES,
  TIME_TO_MARKET_OPTIONS,
  REGULATORY_COMPLEXITY_LEVELS,
  COMPETITION_LEVELS,
  MARKET_SIZE_OPTIONS,
  FORM_LABELS,
  TOOLTIPS,
} from './constants';

interface ViabilityFormProps {
  formData: ViabilityFormData;
  onFieldChange: (field: keyof ViabilityFormData, value: string) => void;
}

export function ViabilityForm({ formData, onFieldChange }: ViabilityFormProps) {
  const FormField = ({ 
    field, 
    options, 
    tooltip 
  }: { 
    field: keyof ViabilityFormData;
    options: readonly { value: string; label: string }[];
    tooltip: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={field} className="text-sm font-medium">
          {FORM_LABELS[field]}
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select value={formData[field]} onValueChange={(value) => onFieldChange(field, value)}>
        <SelectTrigger id={field}>
          <SelectValue placeholder="Selecione uma opção..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        field="productType"
        options={PRODUCT_TYPE_OPTIONS}
        tooltip={TOOLTIPS.productType}
      />
      
      <FormField
        field="developmentCost"
        options={DEVELOPMENT_COST_RANGES}
        tooltip={TOOLTIPS.developmentCost}
      />
      
      <FormField
        field="timeToMarket"
        options={TIME_TO_MARKET_OPTIONS}
        tooltip={TOOLTIPS.timeToMarket}
      />
      
      <FormField
        field="regulatoryComplexity"
        options={REGULATORY_COMPLEXITY_LEVELS}
        tooltip={TOOLTIPS.regulatoryComplexity}
      />
      
      <FormField
        field="competitionLevel"
        options={COMPETITION_LEVELS}
        tooltip={TOOLTIPS.competitionLevel}
      />
      
      <FormField
        field="marketSize"
        options={MARKET_SIZE_OPTIONS}
        tooltip={TOOLTIPS.marketSize}
      />
    </div>
  );
}