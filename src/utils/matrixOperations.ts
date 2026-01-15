/**
 * MATRIX OPERATIONS - Core calculations
 * -----
 * This file constains all the mathematical operations for this project.
 * 
 * Key Concepts:
 * - never mutate the original matrix; always work on copies
 * - use tolerance (1e-10) to handle floating point precision issues
 * - each operation returns a new matrix copy
 * - steps are recorded for the visualization in the ui
 */ 


/** 
 * About Tolerance Constant
 * -----
 * 1e-10 means 0.0000000001 - any number smaller than this is treated as zero.
 * Why? SInce computers can't represent decimal numbers perfectly (e.g., 0.1 + 0.2 != 0.3 exactly),
 * This prevents tiny floating point errors from affecting our calculations.
*/

/**
 * 2. Automated Matrix Inverter
 * Project: Build a program/application that takes a square n-by-n matrix, where n ≤ 10, and uses RREF to return its inverse. If the matrix is singular, the program should return “the matrix is singular.”
 * 
 */

import type { Step, SolutionResult } from '../types/matrix';

// Helper Function: Deep copy matrix
// This is what we'll use to not ovewrite the original matrix
export const copyMatrix = (matrix: number[][]): number[][] => {
    return matrix.map(row => [...row]);
};

// Helper: Swap two rows
// MATH NOTATION: R₁ ↔ R₂
export const swapRows = (matrix: number[][], row1: number, row2: number): number[][] => {
    const result = copyMatrix(matrix);

    // js destructuring swap: [a, b] = [b, a]
    [result[row1], result[row2]] = [result[row2], result[row1]];
    return result;
};

// Helper: Multiply row by scalar
// MATH NOTATION: Rᵢ → k·Rᵢ
// use case: making pivot elements equal to 1
export const multiplyRow = (matrix: number[][], row: number, scalar: number): number[][] => {
    const result = copyMatrix(matrix);
    result[row] = result[row].map(val => val * scalar);
    return result;
};

// Helper: Add multiple of one row to another
// MATH NOTATION: Rᵢ → Rᵢ + k·Rⱼ
// use case: eliminating entries below/above pivots
export const addRows = (
    matrix: number[][], 
    targetRow: number, 
    sourceRow: number, 
    scalar: number
): number[][] => {
    const result = copyMatrix(matrix);
    for (let j = 0; j < result[targetRow].length; j++) {
        result[targetRow][j] += scalar * result[sourceRow][j];
    }
    return result;
};

// Helper: Round small numbers to zero
// why? after many operations, we might get tiny floating point  instead of 0
// this helps clean up the matrix for display
const cleanNumber = (num: number, tolerance: number = 1e-10): number => {
    return Math.abs(num) < tolerance ? 0 : num;
};

// Helper: Clean entire matrix
// applies cleanNumber to every element
const cleanMatrix = (matrix: number[][]): number[][] => {
    return matrix.map(row => row.map(val => cleanNumber(val)));
};

// Helper: Format number for display in steps
// tries to express as integer, fraction, or minimal decimals
const formatStepNumber = (num: number): string => {
    if (Math.abs(num - Math.round(num)) < 1e-10) {
        return Math.round(num).toString();
    }
    
    const fraction = toFraction(num);
    if (fraction) {
        return fraction;
    }
    
    return num.toFixed(2).replace(/\.?0+$/, '');
};

// Helper: Convert decimal to fraction (for simple fractions)
// Algorthm:
// - Try denominators from 2 to 20
// - for each denominator d, calculate numerator n = round(decimal * d)
// - check if n/d is close enough to decimal (within tolerance)
// - if found, simplify fraction using GCD
// Return LATex fraction
const toFraction = (decimal: number): string | null => {
    const tolerance = 1e-6;
    let numerator = 1;
    let denominator = 1;
    
    for (let d = 2; d <= 20; d++) {
        const n = Math.round(decimal * d);
        if (Math.abs(n / d - decimal) < tolerance) {
            numerator = n;
            denominator = d;
            break;
        }
    }
    
    if (denominator === 1) return null;
    
    const gcd = (a: number, b: number): number => b === 0 ? Math.abs(a) : gcd(b, a % b);
    const divisor = gcd(numerator, denominator);
    numerator /= divisor;
    denominator /= divisor;
    
    if (denominator === 1) return null;
    
    return `\\frac{${numerator}}{${denominator}}`;
};

// -----
// MAIN OPERATIONS
// -----

/**
 * Gauss-Jordan Elimination - To RREF
 */
export const gaussJordan = (inputMatrix: number[][]): { steps: Step[], result: SolutionResult } => {
    const steps: Step[] = [];
    let matrix = cleanMatrix(copyMatrix(inputMatrix));
    const n = matrix.length;
    const m = matrix[0].length;
    
    steps.push({
        description: 'Initial Matrix - We will transform this into Reduced Row Echelon Form (RREF)',
        matrix: copyMatrix(matrix),
    });

    let lead = 0;
    let stepCount = 1;

    for (let row = 0; row < n; row++) {
        if (lead >= m) break;

        let pivotRow = row;
        while (Math.abs(matrix[pivotRow][lead]) < 1e-10) {
            pivotRow++;
            if (pivotRow === n) {
                pivotRow = row;
                lead++;
                if (lead === m) break;
            }
        }

        if (lead === m) break;

        if (pivotRow !== row) {
            matrix = swapRows(matrix, row, pivotRow);
            steps.push({
                description: `Step ${stepCount++}: Swap Row ${row + 1} with Row ${pivotRow + 1}\n` +
                            `Operation: $R_{${row + 1}} \\leftrightarrow R_{${pivotRow + 1}}$`,
                matrix: copyMatrix(matrix),
                highlightedRows: [row, pivotRow],
                operation: 'swap'
            });
        }

        const pivot = matrix[row][lead];
        if (Math.abs(pivot) > 1e-10 && Math.abs(pivot - 1) > 1e-10) {
            const factor = 1 / pivot;
            const factorStr = formatStepNumber(factor);
            matrix = multiplyRow(matrix, row, factor);
            matrix = cleanMatrix(matrix);
            steps.push({
                description: `Step ${stepCount++}: Scale Row ${row + 1} to make pivot = 1\n` +
                            `Operation: $R_{${row + 1}} \\rightarrow ${factorStr}R_{${row + 1}}$`,
                matrix: copyMatrix(matrix),
                highlightedRows: [row],
                operation: 'multiply'
            });
        }

        for (let i = 0; i < n; i++) {
            if (i !== row) {
                const factor = matrix[i][lead];
                if (Math.abs(factor) > 1e-10) {
                    const factorStr = formatStepNumber(factor);
                    matrix = addRows(matrix, i, row, -factor);
                    matrix = cleanMatrix(matrix);
                    
                    steps.push({
                        description: `Step ${stepCount++}: Eliminate entries in Column ${lead + 1}\n` +
                                    `Operation: $R_{${i + 1}} \\rightarrow R_{${i + 1}} - ${factorStr}R_{${row + 1}}$`,
                        matrix: copyMatrix(matrix),
                        highlightedRows: [row, i],
                        operation: 'add'
                    });
                }
            }
        }

        lead++;
    }

    steps.push({
        description: 'Reduced Row Echelon Form (RREF) Achieved',
        matrix: copyMatrix(matrix),
    });

    const solution: number[] = [];
    if (m === n + 1) {
        for (let i = 0; i < n; i++) {
            solution.push(cleanNumber(matrix[i][m - 1]));
        }
        
        steps.push({
            description: 'Solution Summary:\n' + 
                        solution.map((val, idx) => `$x_{${idx + 1}} = ${formatStepNumber(val)}$`).join('\n'),
            matrix: copyMatrix(matrix),
        });
    }

    return {
        steps,
        result: {
            finalMatrix: matrix,
            solution: solution.length > 0 ? solution : undefined
        }
    };
};

/**
 * Matrix Inverse using Gauss-Jordan
 */
export const calculateInverse = (inputMatrix: number[][]): { steps: Step[], result: SolutionResult } => {
    const steps: Step[] = [];
    const n = inputMatrix.length;
    
    if (n !== inputMatrix[0].length) {
        steps.push({
            description: 'Error: Only square matrices have inverses',
            matrix: copyMatrix(inputMatrix),
        });
        return {
            steps,
            result: { 
                finalMatrix: inputMatrix,
                error: 'Not a square matrix'
            }
        };
    }

    const augmented: number[][] = inputMatrix.map((row, i) => [
        ...row,
        ...Array(n).fill(0).map((_, j) => (i === j ? 1 : 0))
    ]);

    steps.push({
        description: 'Initial Matrix - Augmented Matrix [A | I]',
        matrix: copyMatrix(augmented),
    });

    const result = gaussJordan(augmented);

    if (!result.result.finalMatrix) {
        steps.push({
            description: 'The matrix is singular',
            matrix: copyMatrix(augmented),
        });
        return {
            steps,
            result: { 
                error: 'The matrix is singular and has no inverse.'
            }
        };
    }

    const isIdentity = result.result.finalMatrix.every((row, i) => 
        row.slice(0, n).every((val, j) => 
            Math.abs(val - (i === j ? 1 : 0)) < 1e-10)
    );

    if (!isIdentity) {
        steps.push({
            description: 'The matrix is singular',
            matrix: copyMatrix(augmented),
        });
        return {
            steps,
            result: { 
                error: 'The matrix is singular and has no inverse.'
            }
        };
    }

    const inverse = result.result.finalMatrix.map(row => row.slice(n));

    steps.push(...result.steps.slice(1));
    steps.push({
        description: 'Inverse Matrix Found',
        matrix: inverse
    });

    return {
        steps,
        result: {
            finalMatrix: inverse
        }
    };
};
