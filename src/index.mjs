// create prompts for each

// //   CREATE_CSS_FILE: a boolean yes or no question,
// //   CREATE_CSS_FILE_AS_MODULE: a boolean yes or no question, but only asked if create_css_file is true,
// //   CREATE_COMPONENT_INDEX: a boolean yes or no question,
// //   ADD_CHILDREN_PROPS: a boolean yes or no question,
// //   ADD_USE_CLIENT_DIRECTIVE: a boolean yes or no question,
// //   USE_INLINE_EXPORT: a boolean yes or no question,
// //   ADD_X_TO_EXTENSION: a boolean ye sor no question,
// //   CSS_FILE_NAME: a text input if create_css_file is true, defualt is styles.css or styles.module.css if create_css_file_as_module,
// //   COMPONENT_FILE_EXTENSION: a single selection between js or ts, or if add_x_to_extension then between jsx or tsx,
import chalk from 'chalk';
import inquirer from 'inquirer';
import { stdin, stdout } from 'process';
import { isMisspelled } from 'spellchecker';

// Capture keypress events to exit on Escape
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', (key) => {
  if (key === '\u001B') {
    // Escape key
    console.log('\nExiting...');
    process.exit(0);
  }
});

function toFunctionName(tokens) {
  tokens = tokens.split(' ');
  tokens = tokens.map((token) => token.trim().replace(/^./, (match) => match.toUpperCase()));
  tokens = tokens.filter((token) => token);
  return tokens.join('');
}

function isValidFunctionName(name) {
  return /^[a-zA-Z_\$][a-zA-Z0-9_\$]*$/.test(name);
}

async function promptUser() {
  // Configuration object for prompts
  const config = {
    COMPONENT_NAME: '',
    CREATE_CSS_FILE: true,
    CREATE_CSS_FILE_AS_MODULE: true,
    CREATE_COMPONENT_INDEX: true,
    ADD_CHILDREN_PROPS: true,
    ADD_USE_CLIENT_DIRECTIVE: true,
    USE_INLINE_EXPORT: true,
    ADD_X_TO_EXTENSION: true,
    CSS_FILE_NAME: 'styles.css',
    COMPONENT_FILE_EXTENSION: 'js', // default value
  };

  // Step 1: Ask for component name with validation
  const { COMPONENT_NAME } = await inquirer.prompt([
    {
      type: 'input',
      name: 'COMPONENT_NAME',
      message: 'Enter the component name (can be multiple words, must form a valid JavaScript function name):',
      validate: (input) => {
        return (
          isValidFunctionName(toFunctionName(input)) ||
          'Please enter a valid JavaScript function name (tokens separated by spaces).'
        );
      },
      transformer: (input) => {
        let tokens = input.split(' ');
        tokens = tokens.map((token) => (isMisspelled(token) ? chalk.red.underline(token) : token));
        return tokens.join(' ');
      },
      default: config.COMPONENT_NAME, // use default if user does not enter
    },
  ]);

  // Join tokens to form a valid function name
  const functionName = toFunctionName(COMPONENT_NAME);

  // Step 2: Ask if to create a CSS file
  const { CREATE_CSS_FILE } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'CREATE_CSS_FILE',
      message: 'Do you want to create a CSS file?',
      default: config.CREATE_CSS_FILE,
    },
  ]);

  // Step 3: Ask if to create CSS file as module if CREATE_CSS_FILE is true
  if (CREATE_CSS_FILE) {
    const { CREATE_CSS_FILE_AS_MODULE } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'CREATE_CSS_FILE_AS_MODULE',
        message: 'Do you want to create the CSS file as a module?',
        default: config.CREATE_CSS_FILE_AS_MODULE,
      },
    ]);
    config.CREATE_CSS_FILE_AS_MODULE = CREATE_CSS_FILE_AS_MODULE;
  }

  // Step 4: Ask for component index creation
  const { CREATE_COMPONENT_INDEX } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'CREATE_COMPONENT_INDEX',
      message: 'Do you want to create a component index file?',
      default: config.CREATE_COMPONENT_INDEX,
    },
  ]);

  // Step 5: Ask for children props
  const { ADD_CHILDREN_PROPS } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'ADD_CHILDREN_PROPS',
      message: 'Do you want to add children props?',
      default: config.ADD_CHILDREN_PROPS,
    },
  ]);

  // Step 6: Ask for use client directive
  const { ADD_USE_CLIENT_DIRECTIVE } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'ADD_USE_CLIENT_DIRECTIVE',
      message: 'Do you want to add a use client directive?',
      default: config.ADD_USE_CLIENT_DIRECTIVE,
    },
  ]);

  // Step 7: Ask for inline export
  const { USE_INLINE_EXPORT } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'USE_INLINE_EXPORT',
      message: 'Do you want to use inline export?',
      default: config.USE_INLINE_EXPORT,
    },
  ]);

  // Step 8: Ask if to add X to extension
  const { ADD_X_TO_EXTENSION } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'ADD_X_TO_EXTENSION',
      message: 'Do you want to add X to the file extension?',
      default: config.ADD_X_TO_EXTENSION,
    },
  ]);

  // Step 9: Ask for CSS file name if CREATE_CSS_FILE is true
  if (CREATE_CSS_FILE) {
    const { CSS_FILE_NAME } = await inquirer.prompt([
      {
        type: 'input',
        name: 'CSS_FILE_NAME',
        message: 'Enter the CSS file name:',
        validate: function (input) {
          return isValidFunctionName(toFunctionName(input));
        },
        transformer: (input) => {
          return input.length ? input + chalk.gray(config.CREATE_CSS_FILE_AS_MODULE ? '.module.css' : '.css') : '';
        },
        filter: function (input) {
          return;
        },
        default: config.CREATE_CSS_FILE_AS_MODULE ? 'styles.module.css' : 'styles.css',
      },
    ]);
    config.CSS_FILE_NAME = CSS_FILE_NAME; // Set the CSS file name
  }

  // Step 10: Ask for component file extension
  const { COMPONENT_FILE_EXTENSION } = await inquirer.prompt([
    {
      type: 'list',
      name: 'COMPONENT_FILE_EXTENSION',
      message: 'Select the component file extension:',
      choices: ADD_X_TO_EXTENSION ? ['jsx', 'tsx'] : ['js', 'ts'],
      default: config.COMPONENT_FILE_EXTENSION,
    },
  ]);

  // Output the collected responses
  console.log({
    functionName,
    CREATE_CSS_FILE,
    CREATE_CSS_FILE_AS_MODULE: config.CREATE_CSS_FILE_AS_MODULE,
    CREATE_COMPONENT_INDEX,
    ADD_CHILDREN_PROPS,
    ADD_USE_CLIENT_DIRECTIVE,
    USE_INLINE_EXPORT,
    ADD_X_TO_EXTENSION,
    CSS_FILE_NAME: config.CSS_FILE_NAME,
    COMPONENT_FILE_EXTENSION,
  });
}

promptUser();
