// @flow

const flowRemoveTypes = require('flow-remove-types');
const { createFilter } = require('rollup-pluginutils');
const { readFile } = require('fs');

type VitePlugin = {
  enforce: string,
  name: string | RegExp,
  transform: (string, string) => (void | { code: string, map: null })
};

type VitePluginOptions = {
  include: string | RegExp | Array<string | RegExp>,
  exclude: string | RegExp | Array<string | RegExp>,
  flow: {
    all: boolean,
    pretty: boolean,
    ignoreUninitializedFields: boolean,
  }
};

type OnLoadOptions = {
  filter: RegExp,
  namespace?: string
};

type OnLoadArgs = {
  path: string,
  namespace: string,
  pluginData?: any
};

type OnLoadCallback = (OnLoadArgs) => Promise<OnLoadResult> | OnLoadResult;

type OnLoadFunc = (OnLoadOptions, OnLoadCallback) => void;

type OnLoadResult = {
  contents: string,
  loader: string
} | {
  errors: Array<Message>;
};

type Message = {
  text: string,
  location: Location | null,
  detail: Error
};

type Location = {
  file: string,
  namespace: string
};

type EsbuildPlugin = {
  name: string,
  setup: ({ onLoad: OnLoadFunc }) => void
};

// noinspection FlowJSFlagCommentPlacement
/**
 * Create a Vite plugin object
 *
 * @param {Object} [options] Filter options
 * @param {string | Regexp | Array<string | Regexp>} [options.include=/\.(flow|jsx?)$/] - Strings and/or regular expressions matching file paths to include
 * @param {string | Regexp | Array<string | Regexp>} [options.exclude=/node_modules/] - Strings and/or regular expressions matching file paths to exclude
 * @param {boolean} [options.flow.all=false] - If true, bypasses looking for an @flow pragma comment before parsing.
 * @param {boolean} [options.flow.pretty=false] - If true, removes types completely rather than replacing with spaces.
 * @param {boolean} [options.flow.ignoreUninitializedFields=false] - If true, removes uninitialized class fields (`foo;`, `foo: string;`)
 *     completely rather than only removing the type. THIS IS NOT SPEC
 *     COMPLIANT! Instead, use `declare foo: string;` for type-only fields.
 *
 * @returns {VitePlugin} Returns esbuild plugin object
 */
module.exports.flowPlugin = function flowPlugin(options: VitePluginOptions = {
  include: /\.(flow|jsx?)$/,
  exclude: /node_modules/,
  flow: {
    all: false,
    pretty: false,
    ignoreUninitializedFields: false,
  },
}): VitePlugin {
  const filter = createFilter(options.include, options.exclude);
  return {
    enforce: 'pre',
    name: 'flow',
    transform(src: string, id: string) { // eslint-disable-line consistent-return
      if (filter(id)) {
        const transformed = flowRemoveTypes(src, options.flow);
        return {
          code: transformed.toString(),
          map: null,
        };
      }
    },
  };
};

const jsxRegex = /\.jsx$/;

const defaultloaderFunction = (path: string) => (jsxRegex.test(path) ? 'jsx' : 'js');

/**
 * Create an esbuild plugin object
 *
 * @param {RegExp} [filter=/\.(flow|jsx?)$/] Regular expression matching the path a files to be processed
 * @param {Function} [loaderFunction=(path) => (/\.jsx$/.test(path) ? 'jsx' : 'js')] Function that accepts the file path and returns the esbuild loader type
 * @param {Object} flowOptions - Options to pass to flow-remove-types
 * @param {boolean} [flowOptions.all=false] - If true, bypasses looking for an @flow pragma comment before parsing.
 * @param {boolean} [flowOptions.pretty=false] - If true, removes types completely rather than replacing with spaces.
 * @param {boolean} [flowOptions.ignoreUninitializedFields=false] - If true, removes uninitialized class fields (`foo;`, `foo: string;`)
 *     completely rather than only removing the type. THIS IS NOT SPEC
 *     COMPLIANT! Instead, use `declare foo: string;` for type-only fields.
 *
 * @returns {EsbuildPlugin} Returns esbuild plugin object
 * @see {@link https://esbuild.github.io/plugins/#resolve-callbacks|esbuild plugins documentation}
 */
module.exports.esbuildFlowPlugin = function esbuildFlowPlugin(filter: RegExp = /\.(flow|jsx?)$/, loaderFunction: (string) => string = defaultloaderFunction, flowOptions: {
  all: boolean,
  pretty: boolean,
  ignoreUninitializedFields: boolean,
} = {
  all: false,
  pretty: false,
  ignoreUninitializedFields: false,
}): EsbuildPlugin {
  return {
    name: 'flow',
    setup(build) {
      build.onLoad({ filter }, async ({ path, namespace }) => {
        try {
          const src = await new Promise((resolve, reject) => {
            readFile(path, (error, data) => {
              if (error) {
                reject(error);
              } else {
                resolve(data.toString('utf-8'));
              }
            });
          });
          const transformed = flowRemoveTypes(src, flowOptions);
          return {
            contents: transformed.toString(),
            loader: loaderFunction(path),
          };
        } catch (error) {
          return {
            errors: [{
              text: error.message,
              location: {
                file: path,
                namespace,
              },
              detail: error,
            }],
          };
        }
      });
    },
  };
};

