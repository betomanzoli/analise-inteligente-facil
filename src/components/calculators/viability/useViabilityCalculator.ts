import { useReducer, useMemo } from 'react';
import { ViabilityFormData, CalculatorAction, CalculatorState } from './types';

const initialFormData: ViabilityFormData = {
  productType: '',
  developmentCost: '',
  timeToMarket: '',
  regulatoryComplexity: '',
  competitionLevel: '',
  marketSize: '',
};

function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      if (!action.field || action.value === undefined) return state;
      
      const updatedFormData = {
        ...state.formData,
        [action.field]: action.value,
      };

      const isValid = Object.values(updatedFormData).every(value => value !== '');

      return {
        formData: updatedFormData,
        isValid,
      };

    case 'RESET_FORM':
      return {
        formData: initialFormData,
        isValid: false,
      };

    default:
      return state;
  }
}

export function useViabilityCalculator() {
  const [state, dispatch] = useReducer(calculatorReducer, {
    formData: initialFormData,
    isValid: false,
  });

  const updateField = (field: keyof ViabilityFormData, value: string) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
  };

  const formData = useMemo(() => state.formData, [state.formData]);
  const isFormValid = useMemo(() => state.isValid, [state.isValid]);

  return {
    formData,
    isFormValid,
    updateField,
    resetForm,
  };
}