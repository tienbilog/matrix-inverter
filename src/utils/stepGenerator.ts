import type { Step } from '../types/matrix';
import { gaussJordan, calculateInverse } from './matrixOperations';

export const generateSteps = (matrix: number[][], operation: string): Step[] => {
    switch (operation.toLowerCase()) {
        case 'gauss-jordan':
        case 'rref':
            return gaussJordan(matrix).steps;
        
        case 'inverse':
            return calculateInverse(matrix).steps;
        
        default:
            return [{
                description: 'Operation not yet implemented',
                matrix: matrix
            }];
    }
};