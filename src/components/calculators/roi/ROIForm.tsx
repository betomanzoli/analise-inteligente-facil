import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, Calculator, AlertCircle, DollarSign } from 'lucide-react';
import { ROIFormData } from './types';

interface ROIFormProps {
  formData: ROIFormData;
  errors: Record<string, string>;
  isLoading: boolean;
  onChange: (field: keyof ROIFormData, value: any) => void;
  onSubmit: () => void;
}

const ROIForm: React.FC<ROIFormProps> = ({
  formData,  
  errors,
  isLoading,
  onChange,
  onSubmit
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value * 1000);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl text-foreground">Calculadora de ROI Farmacêutico</CardTitle>
            <CardDescription>
              Simule o retorno financeiro e ponto de equilíbrio do seu projeto
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Investment Section */}
        <div className="bg-surface-elevated/50 border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Investimento e Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalInvestment">Investimento Total (em milhares de R$)</Label>
              <Input
                id="totalInvestment"
                type="number"
                min="1"
                value={formData.totalInvestment || ''}
                onChange={(e) => onChange('totalInvestment', parseInt(e.target.value) || 0)}
                placeholder="Ex: 5000"
                className={errors.totalInvestment ? 'border-destructive' : ''}
              />
              {formData.totalInvestment && (
                <p className="text-xs text-muted-foreground">
                  Equivale a {formatCurrency(formData.totalInvestment)}
                </p>
              )}
              {errors.totalInvestment && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.totalInvestment}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketLaunchYear">Ano de Lançamento no Mercado</Label>
              <Input
                id="marketLaunchYear"
                type="number"
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 20}
                value={formData.marketLaunchYear || ''}
                onChange={(e) => onChange('marketLaunchYear', parseInt(e.target.value) || 0)}
                placeholder="Ex: 2026"
                className={errors.marketLaunchYear ? 'border-destructive' : ''}
              />
              {errors.marketLaunchYear && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.marketLaunchYear}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="patentExpiryYear">Ano de Expiração da Patente</Label>
              <Input
                id="patentExpiryYear"
                type="number"
                min={formData.marketLaunchYear || new Date().getFullYear()}
                max={(formData.marketLaunchYear || new Date().getFullYear()) + 25}
                value={formData.patentExpiryYear || ''}
                onChange={(e) => onChange('patentExpiryYear', parseInt(e.target.value) || 0)}
                placeholder="Ex: 2038"
                className={errors.patentExpiryYear ? 'border-destructive' : ''}
              />
              {formData.patentExpiryYear && formData.marketLaunchYear && (
                <p className="text-xs text-muted-foreground">
                  Proteção por {formData.patentExpiryYear - formData.marketLaunchYear} anos pós-lançamento
                </p>
              )}
              {errors.patentExpiryYear && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.patentExpiryYear}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsToPeakSales">Anos para Atingir Pico de Vendas</Label>
              <Input
                id="yearsToPeakSales"
                type="number"
                min="1"
                max="15"
                value={formData.yearsToPeakSales || ''}
                onChange={(e) => onChange('yearsToPeakSales', parseInt(e.target.value) || 0)}
                placeholder="Ex: 5"
                className={errors.yearsToPeakSales ? 'border-destructive' : ''}
              />
              {errors.yearsToPeakSales && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.yearsToPeakSales}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Revenue Section */}
        <div className="bg-surface-elevated/50 border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Projeções de Receita</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="peakAnnualSales">Pico de Vendas Anual (em milhares de R$)</Label>
              <Input
                id="peakAnnualSales"
                type="number"
                min="1"
                value={formData.peakAnnualSales || ''}
                onChange={(e) => onChange('peakAnnualSales', parseInt(e.target.value) || 0)}
                placeholder="Ex: 30000"
                className={errors.peakAnnualSales ? 'border-destructive' : ''}
              />
              {formData.peakAnnualSales && (
                <p className="text-xs text-muted-foreground">
                  Receita máxima anual: {formatCurrency(formData.peakAnnualSales)}
                </p>
              )}
              {errors.peakAnnualSales && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.peakAnnualSales}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cost Structure Section */}
        <div className="bg-surface-elevated/50 border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Estrutura de Custos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cogsPercentage">Custo dos Produtos Vendidos - COGS (%)</Label>
              <Input
                id="cogsPercentage"
                type="number"
                min="5"
                max="80"
                value={formData.cogsPercentage || ''}
                onChange={(e) => onChange('cogsPercentage', parseInt(e.target.value) || 0)}
                placeholder="Ex: 25"
                className={errors.cogsPercentage ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Custos diretos de produção como % da receita
              </p>
              {errors.cogsPercentage && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.cogsPercentage}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sgnaPercentage">Despesas SG&A (%)</Label>
              <Input
                id="sgnaPercentage"
                type="number"
                min="5"
                max="60"
                value={formData.sgnaPercentage || ''}
                onChange={(e) => onChange('sgnaPercentage', parseInt(e.target.value) || 0)}
                placeholder="Ex: 30"
                className={errors.sgnaPercentage ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Vendas, Geral e Administrativo como % da receita
              </p>
              {errors.sgnaPercentage && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.sgnaPercentage}
                </p>
              )}
            </div>
          </div>

          {/* Profit Margin Preview */}
          {formData.cogsPercentage && formData.sgnaPercentage && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-foreground">
                <span className="font-medium">Margem de Lucro Operacional Estimada:</span>{' '}
                {(100 - formData.cogsPercentage - formData.sgnaPercentage).toFixed(1)}%
              </p>
            </div>
          )}
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
              Calculando ROI...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Calcular ROI e Break-Even
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ROIForm;