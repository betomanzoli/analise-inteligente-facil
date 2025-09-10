import React, { useReducer, useState } from 'react';
import { toast } from 'sonner';
import RegulatoryForm from './RegulatoryForm';
import RegulatoryResults from './RegulatoryResults';
import { RegulatoryFormData, RegulatoryResult, RegulatoryFormSchema } from './types';
import { calculateRegulatoryRisk } from './calculations';

interface RegulatoryState {
  formData: Partial<RegulatoryFormData>;
  result: RegulatoryResult | null;
  errors: Record<string, string>;
  isValid: boolean;
}

type RegulatoryAction = 
  | { type: 'UPDATE_FIELD'; field: keyof RegulatoryFormData; value: any }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'SET_RESULT'; result: RegulatoryResult }
  | { type: 'RESET_FORM' };

const initialState: RegulatoryState = {
  formData: {
    targetMarkets: ['brazil'],
    mitigationFactors: [],
    hasRegulatoryExpertise: false,
    timelineImportance: 'medium'
  },
  result: null,
  errors: {},
  isValid: false
};

function regulatoryReducer(state: RegulatoryState, action: RegulatoryAction): RegulatoryState {
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

const RegulatoryRiskCalculator: React.FC = () => {
  const [state, dispatch] = useReducer(regulatoryReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);

  const handleFieldChange = (field: keyof RegulatoryFormData, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const validateForm = (data: Partial<RegulatoryFormData>): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    try {
      RegulatoryFormSchema.parse(data);
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
      productCategory: {
        invalid_enum_value: 'Selecione uma categoria de produto válida',
        required_error: 'Categoria do produto é obrigatória'
      },
      noveltyDegree: {
        invalid_enum_value: 'Selecione um grau de novidade válido',
        required_error: 'Grau de novidade é obrigatório'
      },
      targetMarkets: {
        too_small: 'Selecione pelo menos um mercado alvo',
        required_error: 'Mercados alvo são obrigatórios'
      },
      clinicalEvidence: {
        invalid_enum_value: 'Selecione um tipo de evidência clínica válido',
        required_error: 'Evidência clínica é obrigatória'
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
      
      const result = calculateRegulatoryRisk(state.formData as RegulatoryFormData);
      dispatch({ type: 'SET_RESULT', result });
      
      toast.success('Análise de risco regulatório concluída!');
    } catch (error) {
      toast.error('Erro ao calcular risco regulatório. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppShare = () => {
    if (!state.result) return;
    
    const message = `Olá! Utilizei o Avaliador de Risco Regulatório da Essenza e meu projeto obteve risco ${state.result.riskLevel} (${state.result.riskScore}%). Os principais fatores críticos foram: ${state.result.criticalFactors.slice(0, 2).join(', ')}. Gostaria de discutir estratégias de mitigação e planejamento regulatório.`;
    
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {!state.result ? (
        <RegulatoryForm
          formData={state.formData as RegulatoryFormData}
          errors={state.errors}
          isLoading={isLoading}
          onChange={handleFieldChange}
          onSubmit={handleCalculate}
        />
      ) : (
        <RegulatoryResults
          result={state.result}
          onWhatsAppShare={handleWhatsAppShare}
        />
      )}
    </div>
  );
};

export default RegulatoryRiskCalculator;