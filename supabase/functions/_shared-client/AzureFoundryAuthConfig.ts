export interface AzureFoundryAuthConfig {
  // the foundry resource to use
  resourceName: string;
  // the api key of the project belonging to the resource
  projectApiKey: string;
}

export function isCompleteAzureFoundryAuthConfig(
  config: Partial<AzureFoundryAuthConfig>,
): config is AzureFoundryAuthConfig {
  return config.resourceName != null && config.projectApiKey != null;
}
