import React, { useReducer, useState } from 'react';
import { toast } from 'sonner';
import ROIForm from './ROIForm';
import ROIResults from './ROIResults';
import { ROIFormData, ROIResult, ROIFormSchema } from './types';
import { calculateROI } from './calculations';

interface ROIState {
  formData: Partial<ROIFormData>;
  result: ROIResult | null;
  errors: Record<string, string>;
  isValid: boolean;
}

type ROIAction = 
  | { type: 'UPDATE_FIELD'; field: keyof ROIFormData; value: any }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'SET_RESULT'; result: ROIResult }
  | { type: 'RESET_FORM' };

const initialState: ROIState = {
  formData: {
    marketLaunchYear: new Date().getFullYear() + 2,
    patentExpiryYear: new Date().getFullYear() + 12,
    yearsToPeakSales: 5,
    cogsPercentage: 25,
    sgnaPercentage: 30
  },
  result: null,
  errors: {},
  isValid: false
};

function roiReducer(state: ROIState, action: ROIAction): ROIState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      const newFormData = { ...state.formData, [action.field]: action.value };
      return {
        ...state,
        formData: newFormData,
        errors: { ...state.errors, [action.field]: '' }
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'SET_RESULT':
      return { ...state, result: action.result, errors: {} };
    case 'RESET_FORM':
      return initialState;
    default:
      return state;
  }
}

const ROICalculator: React.FC = () => {
  const [state, dispatch] = useReducer(roiReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);

  const handleFieldChange = (field: keyof ROIFormData, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const validateForm = (data: Partial<ROIFormData>): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    try {
      ROIFormSchema.parse(data);
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const field = err.path[0];
          errors[field] = getErrorMessage(field, err.code);
        });
      }
    }
    
    return errors;
  };

  const getErrorMessage = (field: string, code: string): string => {
    const messages: Record<string, Record<string, string>> = {
      totalInvestment: {
        too_small: 'Investimento deve ser maior que zero',
        required_error: 'Investimento total é obrigatório'
      },
      marketLaunchYear: {
        too_small: 'Ano de lançamento deve ser no mínimo o ano atual',
        required_error: 'Ano de lançamento é obrigatório'
      },
      patentExpiryYear: {
        too_small: 'Ano de expiração deve ser posterior ao lançamento',
        required_error: 'Ano de expiração da patente é obrigatório'
      },
      peakAnnualSales: {
        too_small: 'Pico de vendas deve ser maior que zero',
        required_error: 'Pico de vendas anual é obrigatório'
      },
      yearsToPeakSales: {
        too_small: 'Deve ser pelo menos 1 ano para atingir o pico',
        too_big: 'Não pode exceder 15 anos para atingir o pico',
        required_error: 'Anos para atingir pico é obrigatório'
      },
      cogsPercentage: {
        too_small: 'COGS deve ser no mínimo 5%',
        too_big: 'COGS não pode exceder 80%',
        required_error: 'Percentual de COGS é obrigatório'
      },
      sgnaPercentage: {
        too_small: 'SG&A deve ser no mínimo 5%',
        too_big: 'SG&A não pode exceder 60%',
        required_error: 'Percentual de SG&A é obrigatório'
      }
    };
    
    return messages[field]?.[code] || `Campo ${field} inválido`;
  };

  const handleCalculate = async () => {
    const errors = validateForm(state.formData);
    
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', errors });
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = calculateROI(state.formData as ROIFormData);
      dispatch({ type: 'SET_RESULT', result });
      
      toast.success('Análise de ROI concluída!');
    } catch (error) {
      toast.error('Erro ao calcular ROI. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppShare = () => {
    if (!state.result) return;
    
    const message = `Olá! Utilizei a Calculadora de ROI Farmacêutico da Essenza e projetei um retorno de ${state.result.roi.toFixed(1)}% com break-even em ${state.result.breakEvenYear} anos para um investimento de R$ ${(state.formData.totalInvestment! * 1000).toLocaleString('pt-BR')}. Gostaria de validar essas projeções e discutir estratégias de mercado.`;
    
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {!state.result ? (
        <ROIForm
          formData={state.formData as ROIFormData}
          errors={state.errors}
          isLoading={isLoading}
          onChange={handleFieldChange}
          onSubmit={handleCalculate}
        />
      ) : (
        <ROIResults
          result={state.result}
          onWhatsAppShare={handleWhatsAppShare}
        />
      )}
    </div>
  );
};

export default ROICalculator;