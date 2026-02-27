import { z } from 'zod';

export const ConfigSchema = z.object({
  browser: z.object({
    headless: z.boolean().default(false),
    slowMo: z.number().default(0),
    viewport: z.object({
      width: z.number().default(1280),
      height: z.number().default(720),
    }).default({}),
    locale: z.string().default('ru-RU'),
  }).default({}),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(overrides?: Partial<Config>): Config {
  const raw = {
    browser: {
      headless: process.env.MAPUTO_HEADLESS === 'true',
      locale: process.env.MAPUTO_LOCALE || 'ru-RU',
    },
    ...overrides,
  };

  return ConfigSchema.parse(raw);
}
