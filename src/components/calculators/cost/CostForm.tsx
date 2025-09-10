import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign, Calculator, AlertCircle } from 'lucide-react';
import { CostFormData } from './types';
import { PRODUCT_TYPES, DEVELOPMENT_PHASES, COMPLEXITY_LEVELS, TEAM_SIZES } from './constants';

interface CostFormProps {
  formData: CostFormData;
  errors: Record<string, string>;
  isLoading: boolean;
  onChange: (field: keyof CostFormData, value: any) => void;
  onSubmit: () => void;
}

const CostForm: React.FC<CostFormProps> = ({
  formData,  
  errors,
  isLoading,
  onChange,
  onSubmit
}) => {
  const handleMarketChange = (market: 'brazil' | 'usa' | 'europe', checked: boolean) => {
    const currentMarkets = formData.regulatoryMarkets || [];
    if (checked) {
      onChange('regulatoryMarkets', [...currentMarkets, market]);
    } else {
      onChange('regulatoryMarkets', currentMarkets.filter(m => m !== market));
    }
  };

  return (
    <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-primary/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-accent" />
          <div>
            <CardTitle className="text-2xl text-foreground">Calculadora de Custos de Projeto</CardTitle>
            <CardDescription>
              Estime custos totais baseados em benchmarks do setor de Life Sciences
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Type */}
          <div className="space-y-2">
            <Label htmlFor="productType">Tipo de Produto</Label>
            <Select
              value={formData.productType}
              onValueChange={(value) => onChange('productType', value)}
            >
              <SelectTrigger className={errors.productType ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione o tipo de produto" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRODUCT_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.productType && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.productType}
              </p>
            )}
          </div>

          {/* Development Phase */}
          <div className="space-y-2">
            <Label htmlFor="developmentPhase">Fase do Desenvolvimento</Label>
            <Select
              value={formData.developmentPhase}
              onValueChange={(value) => onChange('developmentPhase', value)}
            >
              <SelectTrigger className={errors.developmentPhase ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione a fase" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DEVELOPMENT_PHASES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.developmentPhase && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.developmentPhase}
              </p>
            )}
          </div>

          {/* Complexity Level */}
          <div className="space-y-2">
            <Label htmlFor="complexityLevel">Complexidade Técnica</Label>
            <Select
              value={formData.complexityLevel}
              onValueChange={(value) => onChange('complexityLevel', value)}
            >
              <SelectTrigger className={errors.complexityLevel ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione a complexidade" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(COMPLEXITY_LEVELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.complexityLevel && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.complexityLevel}
              </p>
            )}
          </div>

          {/* Team Size */}
          <div className="space-y-2">
            <Label htmlFor="teamSize">Tamanho da Equipe</Label>
            <Select
              value={formData.teamSize}
              onValueChange={(value) => onChange('teamSize', value)}
            >
              <SelectTrigger className={errors.teamSize ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione o tamanho da equipe" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TEAM_SIZES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.teamSize && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.teamSize}
              </p>
            )}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration">Duração Estimada (em meses)</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            max="120"
            value={formData.duration || ''}
            onChange={(e) => onChange('duration', parseInt(e.target.value) || 0)}
            placeholder="Ex: 24"
            className={errors.duration ? 'border-destructive' : ''}
          />
          {errors.duration && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.duration}
            </p>
          )}
        </div>

        {/* Regulatory Markets */}
        <div className="space-y-3">
          <Label>Mercados Regulatórios Alvo</Label>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="brazil"
                checked={(formData.regulatoryMarkets || []).includes('brazil')}
                onCheckedChange={(checked) => handleMarketChange('brazil', checked as boolean)}
              />
              <Label htmlFor="brazil">Brasil (ANVISA)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="usa"
                checked={(formData.regulatoryMarkets || []).includes('usa')}
                onCheckedChange={(checked) => handleMarketChange('usa', checked as boolean)}
              />
              <Label htmlFor="usa">Estados Unidos (FDA)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="europe"
                checked={(formData.regulatoryMarkets || []).includes('europe')}
                onCheckedChange={(checked) => handleMarketChange('europe', checked as boolean)}
              />
              <Label htmlFor="europe">Europa (EMA)</Label>
            </div>
          </div>
          {errors.regulatoryMarkets && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.regulatoryMarkets}
            </p>
          )}
        </div>

        {/* Clinical Study */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="requiresClinicalStudy"
            checked={formData.requiresClinicalStudy || false}
            onCheckedChange={(checked) => onChange('requiresClinicalStudy', checked)}
          />
          <Label htmlFor="requiresClinicalStudy">Requer estudos clínicos extensivos</Label>
        </div>

        <Button 
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Calculator className="h-4 w-4 mr-2 animate-spin" />
              Calculando...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Custos
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CostForm;