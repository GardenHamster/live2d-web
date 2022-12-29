import { createFilter } from "@rollup/pluginutils";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

function string(opts = {}) {
    if (!opts.include) {
        throw Error("include option should be specified");
    }

    const filter = createFilter(opts.include, opts.exclude);

    return {
        name: "string",

        transform(code, id) {
            if (filter(id)) {
                return {
                    code: `export default ${JSON.stringify(code)};`,
                    map: { mappings: "" }
                };
            }
        },

        renderChunk(code, chunk, outputOptions = {}) {
            return `/*!
 * Live2D Widget
 * https://github.com/stevenjoezhang/live2d-widget
 */
` + code;
        }
    };
}

export default {
    input: "src/waifu-tips.js",
    output: {
        file: 'waifu-tips.js',
        format: 'iife'
    },
    plugins: [
        resolve(),
        string({ include: "**/*.svg" }),
        serve(),
        livereload(),
        commonjs()
    ]
};
