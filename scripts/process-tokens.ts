import fs from 'fs';
import path from 'path';
const foundationTokensImport = require('../src/foundation-light.json');
const governanceTokensImport = require('../src/governance-alias.json');
const standardSpacing = require('../src/spacing-tokens.standart.tokens.json');
const condensedSpacing = require('../src/spacing-tokens.condensed.tokens.json');

function convertToCamelOrLower(s: string): string {
  // If the string starts with a number, return all lowercase without hyphens
  if (s.charAt(0).match(/\d/)) {
    return s.replace(/-+/g, '').toLowerCase();
  }

  // Handling both space-separated and kebab-case strings
  const words = s.replace(/-+/g, ' ').split(' ');
  return (
    words[0].toLowerCase() +
    words
      .slice(1)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
  );
}

function flattenObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if ('$value' in obj) {
    return obj['$value'];
  }

  const flattened: any = {};
  for (const key in obj) {
    flattened[key] = flattenObject(obj[key]);
  }
  return flattened;
}
// Define the function to map governance alias tokens to foundation tokens
function mapAliasToFoundation(
  governanceTokens: any,
  foundationTokens: any
) {
  const processedTokens: any = {};

  function processToken(token: any) {
    if (typeof token !== 'object' || token === null) {
      return token;
    }

    if ('$value' in token) {
      if (
        token['$value'].startsWith('{') &&
        token['$value'].endsWith('}')
      ) {
        const pathTokens = token['$value'].slice(1, -1).split('.');
        let foundationValue: any = foundationTokens;
        for (const p of pathTokens) {
          foundationValue = foundationValue[p] || {};
        }
        return foundationValue['$value'] || foundationValue;
      } else {
        return token['$value']; // Direct value
      }
    }

    const processedToken: any = {};
    for (const key in token) {
      const camelCaseKey = convertToCamelOrLower(key);
      processedToken[camelCaseKey] = processToken(token[key]);
    }
    return processedToken;
  }

  for (const category in governanceTokens) {
    processedTokens[category] = processToken(
      governanceTokens[category]
    );
  }

  return processedTokens;
}

// Define the function to generate TypeScript interfaces based on the token structure

function generateTypescriptInterfacesExported(
  tokens: any,
  parentName = 'Tokens',
  knownStructures: any = {}
): string {
  let tsInterfaces = '';
  const tokenStructure = JSON.stringify(tokens);

  // Check if the structure is already known
  if (knownStructures[tokenStructure]) {
    return knownStructures[tokenStructure];
  }

  let currentInterface = `export interface ${parentName} {\n`;
  for (const key in tokens) {
    if (typeof tokens[key] === 'object') {
      const nestedInterfaceName = `${parentName}_${
        convertToCamelOrLower(key).charAt(0).toUpperCase() +
        convertToCamelOrLower(key).slice(1)
      }`;

      // If the structure matches the repetitive tag structure, use the common TagStructure interface
      if (tokens[key].content && tokens[key].surface) {
        currentInterface += `  ${convertToCamelOrLower(
          key
        )}: TagStructure;\n`;
        knownStructures[tokenStructure] = 'TagStructure';
        if (!knownStructures['TagStructure']) {
          tsInterfaces += `export interface TagStructure {\n  content: string;\n  surface: string;\n}\n\n`;
          knownStructures['TagStructure'] = true;
        }
      } else {
        currentInterface += `  ${convertToCamelOrLower(
          key
        )}: ${nestedInterfaceName};\n`;
        tsInterfaces += generateTypescriptInterfacesExported(
          tokens[key],
          nestedInterfaceName,
          knownStructures
        );
      }
    } else {
      currentInterface += `  ${convertToCamelOrLower(
        key
      )}: string;\n`;
    }
  }
  currentInterface += '}\n\n';
  tsInterfaces = currentInterface + tsInterfaces;

  // Store the generated export interface with its structure for reuse
  knownStructures[tokenStructure] = parentName;

  return tsInterfaces;
}
function convertPxToRem(pxValue: number): string {
  return (pxValue / 16).toFixed(2) + 'rem';
}

function flattenSpacingStructure(obj: any): any {
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

  const flattened: any = {};
  for (const key in obj) {
    flattened[convertToCamelOrLower(key)] = flattenSpacingStructure(
      obj[key]
    );
  }
  return flattened;
}

function processSpacingTokens(standard: any, condensed: any): any {
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
const processedGovernanceTokens = mapAliasToFoundation(
  governanceTokensImport,
  foundationTokensImport
);

// Write the processed governance tokens to the dist directory
fs.writeFileSync(
  path.join(__dirname, '..', 'dist', 'index.js'),
  'export default ' + JSON.stringify(processedGovernanceTokens)
);

// Generate and write TypeScript interfaces
const tsInterfacesOutput = generateTypescriptInterfacesExported(
  processedGovernanceTokens
);
fs.writeFileSync(
  path.join(__dirname, '..', 'dist', 'index.d.ts'),
  tsInterfacesOutput
);

// Process the spacing tokens using a different variable
const processedSpacingTokensOutput = processSpacingTokens(
  standardSpacing,
  condensedSpacing
);

// Write the processed spacing tokens to the dist directory
fs.writeFileSync(
  path.join(__dirname, '..', 'dist', 'spacing.js'),
  'export default ' + JSON.stringify(processedSpacingTokensOutput)
);
