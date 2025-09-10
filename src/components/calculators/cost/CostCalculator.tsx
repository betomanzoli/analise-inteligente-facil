import React, { useReducer, useState } from 'react';
import { toast } from 'sonner';
import CostForm from './CostForm';
import CostResults from './CostResults';
import { CostFormData, CostResult, CostFormSchema } from './types';
import { calculateCost } from './calculations';

interface CostState {
  formData: Partial<CostFormData>;
  result: CostResult | null;
  errors: Record<string, string>;
  isValid: boolean;
}

type CostAction = 
  | { type: 'UPDATE_FIELD'; field: keyof CostFormData; value: any }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'SET_RESULT'; result: CostResult }
  | { type: 'RESET_FORM' };

const initialState: CostState = {
  formData: {
    regulatoryMarkets: ['brazil']
  },
  result: null,
  errors: {},
  isValid: false
};

function costReducer(state: CostState, action: CostAction): CostState {
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

const CostCalculator: React.FC = () => {
  const [state, dispatch] = useReducer(costReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);

  const handleFieldChange = (field: keyof CostFormData, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const validateForm = (data: Partial<CostFormData>): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    try {
      CostFormSchema.parse(data);
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
      productType: {
        invalid_enum_value: 'Selecione um tipo de produto válido',
        required_error: 'Tipo de produto é obrigatório'
      },
      developmentPhase: {
        invalid_enum_value: 'Selecione uma fase de desenvolvimento válida',
        required_error: 'Fase do desenvolvimento é obrigatória'
      },
      complexityLevel: {
        invalid_enum_value: 'Selecione um nível de complexidade válido',
        required_error: 'Complexidade técnica é obrigatória'
      },
      teamSize: {
        invalid_enum_value: 'Selecione um tamanho de equipe válido',
        required_error: 'Tamanho da equipe é obrigatório'
      },
      duration: {
        too_small: 'Duração deve ser no mínimo 1 mês',
        too_big: 'Duração não pode exceder 120 meses',
        required_error: 'Duração é obrigatória'
      },
      regulatoryMarkets: {
        too_small: 'Selecione pelo menos um mercado regulatório',
        required_error: 'Mercado regulatório é obrigatório'
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
      
      const result = calculateCost(state.formData as CostFormData);
      dispatch({ type: 'SET_RESULT', result });
      
      toast.success('Análise de custos concluída!');
    } catch (error) {
      toast.error('Erro ao calcular custos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppShare = () => {
    if (!state.result) return;
    
    const message = `Olá! Utilizei a Calculadora de Custos da Essenza e obtive uma estimativa de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(state.result.totalCost * 1000)} para meu projeto. Gostaria de discutir estratégias de otimização de custos e cenários alternativos.`;
    
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {!state.result ? (
        <CostForm
          formData={state.formData as CostFormData}
          errors={state.errors}
          isLoading={isLoading}
          onChange={handleFieldChange}
          onSubmit={handleCalculate}
        />
      ) : (
        <CostResults
          result={state.result}
          onWhatsAppShare={handleWhatsAppShare}
        />
      )}
    </div>
  );
};

export default CostCalculator;