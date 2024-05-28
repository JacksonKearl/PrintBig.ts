import * as esbuild from "esbuild"

const watch = process.argv.includes("--watch")
if (watch) {
  console.log("watching...")
}

const options = {
  entryPoints: ["src/index.tsx"],
  bundle: true,
  outfile: "public/index.js",
  ...(watch ? { sourcemap: true } : { minify: true }),
}

if (watch) {
  const ctx = await esbuild.context(options)
  await ctx.watch()
} else {
  await esbuild.build(options)
}
