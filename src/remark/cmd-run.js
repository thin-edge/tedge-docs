/*
  Convert a code block with the command="<command>" property where the code block contents
  replaced with the output of the command.

  The plugin will only activate if the code block use the syntax set to `run` and a `command=""` property is set.

  Example

  The following markdown will get converted from:

  ```run title="List items in a directory" command="ls -l" lang="sh"
  total 1
  -rw-r--r--@   1 tedge  staff     209 Jun 22 11:13 Dockerfile
  ```

  to:

  ```sh title="List items in a directory"
  total 3
  -rw-r--r--@   1 tedge  staff     209 Jun 22 11:13 Dockerfile
  -rw-r--r--    1 tedge  staff    2290 Jun 30 22:45 README.md
  -rw-r--r--@   1 tedge  staff      89 Jun 22 11:13 babel.config.js
  ```

  Note:
  * The code block
*/
const { execSync } = require('child_process');
const visit = require('unist-util-visit');
const metaUtils = require('./meta');

const plugin = (options) => {
  const transformer = async (ast) => {
    visit(ast, 'code', (node) => {
      if (node.lang != 'run' || !node.value) return;

      const meta = metaUtils.fromString(node.meta || '');
      if (!meta.command) return;

      // execute command and use the result in the code block
      try {
        const output = execSync(meta.command, {
          timeout: 2000,
          stdio: [
            'ignore', // stdin
            'pipe', // stdout
            'ignore', // stderr
          ],
        });

        node.value = output.toString('utf8').trimEnd();

        // remove meta info related to this plugin
        node.meta = metaUtils.toString(meta, ['command', 'lang']);
        node.lang = meta.lang || '';
      } catch (error) {
        if (options.logErrors) {
          console.warn('Failed to run command', {
            meta,
            error: `${error}`,
          });
        }

        if (options.showErrors) {
          node.value = `${error}`.trimEnd();
        }

        if (options.strict) {
          throw error;
        }
      }
    });
  };
  return transformer;
};

module.exports = plugin;
