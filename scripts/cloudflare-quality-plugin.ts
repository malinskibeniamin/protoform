import cloudflare from '@cloudflare/oxlint-config';
import { z } from 'zod';

const specifier = cloudflare.jsPlugins?.find((plugin) => typeof plugin !== 'string' && plugin.name === 'quality');
if (specifier === undefined || typeof specifier === 'string') {
  throw new Error('The Cloudflare Oxlint preset no longer exposes the quality plugin.');
}

const pluginModule: unknown = await import(specifier.specifier);
const pluginModuleSchema = z.object({ default: z.looseObject({ rules: z.record(z.string(), z.unknown()) }) });

export default pluginModuleSchema.parse(pluginModule).default;
