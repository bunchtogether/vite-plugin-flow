//      

const flowRemoveTypes = require('flow-remove-types');
const { createFilter } = require('rollup-pluginutils');
const { readFile } = require('fs');

                   
                  
                        
                                                                      
  

                          
                                                    
                                                   
  

                      
                 
                    
  

                   
               
                    
                  
  

                                                                           

                                                          

                     
                   
                
     
                         
  

                
               
                            
               
  

                 
               
                   
  

                      
               
                                       
  

/**
 * Create a Vite plugin object
 * @param {Object} [options] Filter options
 * @param {string | Regexp | Array<string | Regexp>} [options.include=/\.(flow|jsx?)$/] - Strings and/or regular expressions matching file paths to include
 * @param {string | Regexp | Array<string | Regexp>} [options.exclude=/node_modules/] - Strings and/or regular expressions matching file paths to exclude
 * @returns {VitePlugin} Returns esbuild plugin object
 */
module.exports.flowPlugin = function flowPlugin(options                    = { include: /\.(flow|jsx?)$/, exclude: /node_modules/ })            {
  const filter = createFilter(options.include, options.exclude);
  return {
    enforce: 'pre',
    name: 'flow',
    transform(src       , id       ) { // eslint-disable-line consistent-return
      if (filter(id)) {
        const transformed = flowRemoveTypes(src);
        return {
          code: transformed.toString(),
          map: transformed.generateMap(),
        };
      }
    },
  };
};

const jsxRegex = /\.jsx$/;

const defaultloaderFunction = (path       ) => (jsxRegex.test(path) ? 'jsx' : 'js');

/**
 * Create an esbuild plugin object
 * @param {RegExp} [filter=/\.(flow|jsx?)$/] Regular expression matching the path a files to be processed
 * @param {Function} [loaderFunction=(path) => (/\.jsx$/.test(path) ? 'jsx' : 'js')] Function that accepts the file path and returns the esbuild loader type
 * @returns {EsbuildPlugin} Returns esbuild plugin object
 * @see {@link https://esbuild.github.io/plugins/#resolve-callbacks|esbuild plugins documentation}
 */
module.exports.esbuildFlowPlugin = function esbuildFlowPlugin(filter         = /\.(flow|jsx?)$/, loaderFunction                     = defaultloaderFunction)               {
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
          const transformed = flowRemoveTypes(src);
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

