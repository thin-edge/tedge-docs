/*
  Convert a code block with the command="<command>" property where the code block contents
  replaced with the output of the command.

  The plugin will only activate if the code block use the syntax set to `run` and a `command=""` property is set.

  Example

  The following markdown will get converted from:

  ```text title="List items in a directory" command="ls -l"
  total 1
  -rw-r--r--@   1 tedge  staff     209 Jun 22 11:13 Dockerfile
  ```

  to:

  ```text title="List items in a directory"
  total 3
  -rw-r--r--@   1 tedge  staff     209 Jun 22 11:13 Dockerfile
  -rw-r--r--    1 tedge  staff    2290 Jun 30 22:45 README.md
  -rw-r--r--@   1 tedge  staff      89 Jun 22 11:13 babel.config.js
  ```

  Note:
  * The code block
*/
import { visit } from 'unist-util-visit';
import { execSync } from 'child_process';
import metaUtils from '../meta/index.js';

function isTedgeCommand(cmd) {
  // note: tedge-p11-server is excluded as it is not included in the tedge container
  // image as the images only include static binaries and tedge-p11-server
  // needs to be dynamically linked
  return (`${cmd}`.startsWith('tedge') || `${cmd}`.startsWith('c8y')) && !`${cmd}`.startsWith('tedge-p11-server');
}

function getTedgeContainerImageForVersion(docPath) {
  // Determine which docker image to run the tedge command
  // Note: Technically we could use the example version, however it isn't
  // worth the effort since the docs only show the last official version
  // and the main branch version
  return /\/version-[0-9]+\.[0-9]+\.[0-9]+\//i.test(docPath) ? 'ghcr.io/thin-edge/tedge:latest' : 'ghcr.io/thin-edge/tedge-main:latest';
}

const plugin = (options) => {
  const defaultLang = 'text';
  const transformer = async (ast, vfile) => {
    visit(ast, 'code', (node) => {
      const meta = metaUtils.fromString(node.meta || '');
      if (!meta.command) return;

      // set defaults
      if (!meta.title) {
        meta.title = 'Output';
      }

      // execute command and use the result in the code block
      try {
        let command = meta.command;
        if (isTedgeCommand(meta.command)) {
          // use docker to run the commands but use two different
          // images referring to either the latest official release, or the main
          // branch version based on which markdown file is currently being processed
          // (as the version is included in the path)
          const containerImage = getTedgeContainerImageForVersion(vfile.path);
          command = `docker run --rm ${containerImage} ${meta.command}`;
        }
        const output = execSync(command, {
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

        if (node.lang == 'code') {
          node.lang = meta.lang || defaultLang;
        } else {
          node.lang = node.lang || meta.lang || defaultLang;
        }
      } catch (error) {
        if (options.logErrors) {
          console.warn('Failed to run command', {
            meta,
            file: vfile.path,
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

export default plugin;
