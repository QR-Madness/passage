import {z} from "zod";

export const ProviderEntrySchema = z.object({
  provider_url: z.url(),
  client_id: z.string(),
  test_config: z.object({
    use_mock_provider: z.boolean(),
  }).optional(),
}).loose();

export type ProviderEntryType = z.infer<typeof ProviderEntrySchema>;
export const ProvidersConfig = z.object({
  providers: z.array(ProviderEntrySchema),
}).loose();

export type ProvidersConfigType = z.infer<typeof ProvidersConfig>;
