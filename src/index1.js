const { mockData, handlers, requestHandler } = require('./mock_api_template');
const fs = require('fs');

// grab mock api name from terminal argument
const [name, resourceName = name] = process.argv.slice(2);

if (!name) throw new Error('You must include a mock api name.');

const dir = `./mockApi/${name}ApiMock`;

// throw an error if the file already exists
if (fs.existsSync(dir)) throw new Error('A mock api with that name already exists.');

// create the folder
fs.mkdirSync(dir);

function writeFileErrorHandler(err) {
  if (err) throw err;
}

// mockData.json
fs.writeFile(`${dir}/mockData.json`, mockData(name), writeFileErrorHandler);
// handlers
fs.writeFile(`${dir}/${name}Handlers.js`, handlers(name, resourceName), writeFileErrorHandler);
// requestHandlers
fs.writeFile(`${dir}/requestHandler.js`, requestHandler(name), writeFileErrorHandler);

// insert new handlers into 'mockApi/handlers.js file
fs.readFile('./mockApi/handlers.js', 'utf8', function(err, data) {
  if (err) throw err;

  // grab all handlers and combine them with new handler
  const currentHandlers = data.match(/(?<=import { )(.*?)(?= } from)/g);
  const newHandler = [`${name}Handlers`, ...currentHandlers].sort();

  // create the import and export statements
  const importStatements = newHandler
    .map(importName => {
      const dirName = importName.split('Handlers')[0];
      return `import { ${importName} } from './${dirName}ApiMock/${importName}';\n`;
    })
    .join('');

  const exportStatements = `export const handlers = [\n${newHandler
    .map(handler => `...${handler},\n`)
    .join('')}];\n`;

  const fileContent = `${importStatements}\n${exportStatements}`;

  fs.writeFile(`./mockApi/handlers.js`, fileContent, writeFileErrorHandler);
});
