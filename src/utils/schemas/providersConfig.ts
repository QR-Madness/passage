import {z} from "zod";
import {RegexPatterns} from "../regex";

export const ProviderEntrySchema = z.object({
    name: z.string(),
    auth_protocol: z.string({error: "Invalid/Missing provider type"}).regex(RegexPatterns.ensureSupportedAuthProtocol),
    ServerConfig: z.object({
        endpoint_url: z.string(),
        client_id: z.string(),
    }).loose(),
    TestConfig: z.object({
        keycloak_realm: z.string(),
    }).loose().optional(),
    OidcConfig: z.object({
        supported_auth_flows: z.array(z.string()),
    }).loose().optional()
}).loose();

export type ProviderEntryType = z.infer<typeof ProviderEntrySchema>;
export const ProvidersConfig = z.object({
    providers: z.array(ProviderEntrySchema),
}).loose();

export type ProvidersConfigType = z.infer<typeof ProvidersConfig>;
