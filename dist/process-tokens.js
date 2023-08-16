"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const foundationTokensImport = require('../src/foundation-light.json');
const governanceTokensImport = require('../src/governance-alias.json');
const standardSpacing = require('../src/spacing-tokens.standart.tokens.json');
const condensedSpacing = require('../src/spacing-tokens.condensed.tokens.json');
function convertToCamelOrLower(s) {
    // If the string starts with a number, return all lowercase without hyphens
    if (s.charAt(0).match(/\d/)) {
        return s.replace(/-+/g, '').toLowerCase();
    }
    // Handling both space-separated and kebab-case strings
    const words = s.replace(/-+/g, ' ').split(' ');
    return (words[0].toLowerCase() +
        words
            .slice(1)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(''));
}
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Define the function to map governance alias tokens to foundation tokens
function flattenObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    if ('$value' in obj) {
        return obj['$value'];
    }
    const flattened = {};
    for (const key in obj) {
        flattened[key] = flattenObject(obj[key]);
    }
    return flattened;
}
function mapAliasToFoundation(governanceTokens, foundationTokens) {
    const processedTokens = {};
    function processToken(token) {
        if (typeof token !== 'object' || token === null) {
            return token;
        }
        if ('$value' in token) {
            if (token['$value'].startsWith('{') &&
                token['$value'].endsWith('}')) {
                const pathTokens = token['$value'].slice(1, -1).split('.');
                let foundationValue = foundationTokens;
                for (const p of pathTokens) {
                    foundationValue = foundationValue[p] || {};
                }
                return foundationValue['$value'] || foundationValue;
            }
            else {
                return token['$value']; // Direct value
            }
        }
        const processedToken = {};
        for (const key in token) {
            const camelCaseKey = convertToCamelOrLower(key);
            processedToken[camelCaseKey] = processToken(token[key]);
        }
        return processedToken;
    }
    for (const category in governanceTokens) {
        processedTokens[category] = processToken(governanceTokens[category]);
    }
    return processedTokens;
}
// Define the function to generate TypeScript interfaces based on the token structure
function generateTypescriptInterfacesExported(tokens, parentName = 'Tokens', knownStructures = {}) {
    let tsInterfaces = '';
    const tokenStructure = JSON.stringify(tokens);
    // Check if the structure is already known
    if (knownStructures[tokenStructure]) {
        return knownStructures[tokenStructure];
    }
    let currentInterface = `export interface ${parentName} {\n`;
    for (const key in tokens) {
        if (typeof tokens[key] === 'object') {
            const nestedInterfaceName = `${parentName}_${convertToCamelOrLower(key).charAt(0).toUpperCase() +
                convertToCamelOrLower(key).slice(1)}`;
            // If the structure matches the repetitive tag structure, use the common TagStructure interface
            if (tokens[key].content && tokens[key].surface) {
                currentInterface += `  ${convertToCamelOrLower(key)}: TagStructure;\n`;
                knownStructures[tokenStructure] = 'TagStructure';
                if (!knownStructures['TagStructure']) {
                    tsInterfaces += `export interface TagStructure {\n  content: string;\n  surface: string;\n}\n\n`;
                    knownStructures['TagStructure'] = true;
                }
            }
            else {
                currentInterface += `  ${convertToCamelOrLower(key)}: ${nestedInterfaceName};\n`;
                tsInterfaces += generateTypescriptInterfacesExported(tokens[key], nestedInterfaceName, knownStructures);
            }
        }
        else {
            currentInterface += `  ${convertToCamelOrLower(key)}: string;\n`;
        }
    }
    currentInterface += '}\n\n';
    tsInterfaces = currentInterface + tsInterfaces;
    // Store the generated export interface with its structure for reuse
    knownStructures[tokenStructure] = parentName;
    return tsInterfaces;
}
function convertPxToRem(pxValue) {
    return (pxValue / 16).toFixed(2) + 'rem';
}
function flattenSpacingStructure(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    if ('$value' in obj) {
        let value = obj['$value'];
        // Convert pixel values to rem
        if (typeof value === 'number') {
            return convertPxToRem(value);
        }
        return value;
    }
    const flattened = {};
    for (const key in obj) {
        flattened[convertToCamelOrLower(key)] = flattenSpacingStructure(obj[key]);
    }
    return flattened;
}
function processSpacingTokens(standard, condensed) {
    return {
        spacing: {
            standard: flattenSpacingStructure(standard['spacing']),
            condensed: flattenSpacingStructure(condensed['spacing']),
        },
        radius: {
            standard: flattenSpacingStructure(standard['radius']),
            condensed: flattenSpacingStructure(condensed['radius']),
        },
    };
}
// Process the governance tokens
const processedGovernanceTokens = mapAliasToFoundation(governanceTokensImport, foundationTokensImport);
// Write the processed governance tokens to the dist directory
fs_1.default.writeFileSync(path_1.default.join(__dirname, '..', 'dist', 'index.js'), 'export default ' + JSON.stringify(processedGovernanceTokens));
// Generate and write TypeScript interfaces
const tsInterfacesOutput = generateTypescriptInterfacesExported(processedGovernanceTokens);
fs_1.default.writeFileSync(path_1.default.join(__dirname, '..', 'dist', 'index.d.ts'), tsInterfacesOutput);
// Process the spacing tokens using a different variable name to avoid redeclaration
const processedSpacingTokensOutput = processSpacingTokens(standardSpacing, condensedSpacing);
// Write the processed spacing tokens to the dist directory
fs_1.default.writeFileSync(path_1.default.join(__dirname, '..', 'dist', 'spacing.js'), 'export default ' + JSON.stringify(processedSpacingTokensOutput));
