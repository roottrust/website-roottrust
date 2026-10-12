import { extname } from "node:path";

// src/lib/server uses extensionless relative imports (bundler style); Node ESM needs the explicit .ts file.
export async function resolve(specifier, context, nextResolve) {
  const relative = specifier.startsWith("./") || specifier.startsWith("../");
  if (!relative || extname(specifier) !== "") return nextResolve(specifier, context);
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (error.code !== "ERR_MODULE_NOT_FOUND") throw error;
    return nextResolve(`${specifier}.ts`, context);
  }
}
