import {z} from "zod";

export const ProviderEntrySchema = z.object({
    name: z.string(),
    type: z.string({error: "Invalid/Missing provider type"}).regex(/^(oidc|oauth2|saml)$/),
    config: z.object({
        client_id: z.string(),
        provider_url: z.string(),
        // provider_url: z.url({pattern: new RegExp('/*')}),
    }),
    test_config: z.object({
        use_mock_provider: z.boolean(),
    }).optional(),
}).loose();

export type ProviderEntryType = z.infer<typeof ProviderEntrySchema>;
export const ProvidersConfig = z.object({
    providers: z.array(ProviderEntrySchema),
}).loose();

export type ProvidersConfigType = z.infer<typeof ProvidersConfig>;
