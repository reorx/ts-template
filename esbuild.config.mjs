
import esbuild from "esbuild";
import process from "process";
import builtins from 'builtin-modules'
import fs from 'fs'
import child_process from 'child_process'

const prod = (process.argv[2] === 'prod');

let runScriptPlugin = {
  name: 'run-script',
  setup(build) {
    build.onEnd(result => {
      const scriptName = 'on_build_success.sh'
      if (result.errors.length > 0) { return }
      if (!fs.existsSync(scriptName)) { return }
      console.log(`run ${scriptName}`);
      child_process.execSync(`bash ${scriptName}`, (err, stdout, stderr) => {
        if (err) {
          console.error(`run ${scriptName} error:`, err, stdout, stderr)
        }
      })
    })
  },
}

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  external: [
    ...builtins],
  format: 'cjs',
  watch: !prod,
  target: 'es2016',
  logLevel: "info",
  sourcemap: prod ? false : 'inline',
  treeShaking: true,
  outdir: 'dist',
  plugins: [runScriptPlugin],
}).catch(() => process.exit(1));
