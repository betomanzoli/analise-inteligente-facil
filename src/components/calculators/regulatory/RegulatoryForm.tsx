import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Calculator, AlertCircle } from 'lucide-react';
import { RegulatoryFormData } from './types';
import { PRODUCT_CATEGORIES, NOVELTY_DEGREES, TARGET_MARKETS, CLINICAL_EVIDENCE, MITIGATION_FACTORS } from './constants';

interface RegulatoryFormProps {
  formData: RegulatoryFormData;
  errors: Record<string, string>;
  isLoading: boolean;
  onChange: (field: keyof RegulatoryFormData, value: any) => void;
  onSubmit: () => void;
}

const RegulatoryForm: React.FC<RegulatoryFormProps> = ({
  formData,  
  errors,
  isLoading,
  onChange,
  onSubmit
}) => {
  const handleMarketChange = (market: keyof typeof TARGET_MARKETS, checked: boolean) => {
    const currentMarkets = formData.targetMarkets || [];
    if (checked) {
      onChange('targetMarkets', [...currentMarkets, market]);
    } else {
      onChange('targetMarkets', currentMarkets.filter(m => m !== market));
    }
  };

  const handleMitigationChange = (factor: keyof typeof MITIGATION_FACTORS, checked: boolean) => {
    const currentFactors = formData.mitigationFactors || [];
    if (checked) {
      onChange('mitigationFactors', [...currentFactors, factor]);
    } else {
      onChange('mitigationFactors', currentFactors.filter(f => f !== factor));
    }
  };

  return (
    <Card className="border-warning/20 bg-gradient-to-r from-warning/5 to-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-warning" />
          <div>
            <CardTitle className="text-2xl text-foreground">Avaliador de Risco Regulatório</CardTitle>
            <CardDescription>
              Avalie riscos regulatórios para ANVISA, FDA, EMA e outras agências
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Category */}
          <div className="space-y-2">
            <Label htmlFor="productCategory">Categoria do Produto</Label>
            <Select
              value={formData.productCategory}
              onValueChange={(value) => onChange('productCategory', value)}
            >
              <SelectTrigger className={errors.productCategory ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRODUCT_CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.productCategory && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.productCategory}
              </p>
            )}
          </div>

          {/* Novelty Degree */}
          <div className="space-y-2">
            <Label htmlFor="noveltyDegree">Grau de Novidade</Label>
            <Select
              value={formData.noveltyDegree}
              onValueChange={(value) => onChange('noveltyDegree', value)}
            >
              <SelectTrigger className={errors.noveltyDegree ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione o grau de novidade" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NOVELTY_DEGREES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.noveltyDegree && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.noveltyDegree}
              </p>
            )}
          </div>

          {/* Clinical Evidence */}
          <div className="space-y-2">
            <Label htmlFor="clinicalEvidence">Evidência Clínica Necessária</Label>
            <Select
              value={formData.clinicalEvidence}
              onValueChange={(value) => onChange('clinicalEvidence', value)}
            >
              <SelectTrigger className={errors.clinicalEvidence ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione o tipo de evidência" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CLINICAL_EVIDENCE).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clinicalEvidence && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.clinicalEvidence}
              </p>
            )}
          </div>

          {/* Timeline Importance */}
          <div className="space-y-2">
            <Label htmlFor="timelineImportance">Importância do Cronograma</Label>
            <Select
              value={formData.timelineImportance}
              onValueChange={(value) => onChange('timelineImportance', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a importância" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa - flexibilidade para aguardar</SelectItem>
                <SelectItem value="medium">Média - cronograma importante</SelectItem>
                <SelectItem value="high">Alta - cronograma crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Target Markets */}
        <div className="space-y-3">
          <Label>Mercados Regulatórios Alvo</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(TARGET_MARKETS).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={(formData.targetMarkets || []).includes(key as any)}
                  onCheckedChange={(checked) => handleMarketChange(key as any, checked as boolean)}
                />
                <Label htmlFor={key}>{label}</Label>
              </div>
            ))}
          </div>
          {errors.targetMarkets && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.targetMarkets}
            </p>
          )}
        </div>

        {/* Mitigation Factors */}
        <div className="space-y-3">
          <Label>Fatores de Mitigação Já Adotados</Label>
          <div className="space-y-2">
            {Object.entries(MITIGATION_FACTORS).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={(formData.mitigationFactors || []).includes(key as any)}
                  onCheckedChange={(checked) => handleMitigationChange(key as any, checked as boolean)}
                />
                <Label htmlFor={key} className="text-sm">{label}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Expertise */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasRegulatoryExpertise"
            checked={formData.hasRegulatoryExpertise || false}
            onCheckedChange={(checked) => onChange('hasRegulatoryExpertise', checked)}
          />
          <Label htmlFor="hasRegulatoryExpertise">Equipe possui expertise regulatória interna</Label>
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
              Avaliando Riscos...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Avaliar Risco Regulatório
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RegulatoryForm;