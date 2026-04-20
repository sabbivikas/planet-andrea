export interface PostHogConfig {
  projectToken?: string;
  projectId?: string;
  projectRegion?: string;
  host?: string;
  enabled: boolean;
}

function readPublicEnv(name: string): string | undefined {
  const value = process.env[name]?.trim() ?? undefined;
  return value === '' ? undefined : value;
}

function resolvePosthogHost(region: string | undefined): string | undefined {
  if (!region) {
    return undefined;
  }

  const normalizedRegion = region.trim().toLowerCase();
  if (normalizedRegion === 'us' || normalizedRegion === 'us1' || normalizedRegion === 'usa') {
    return 'https://us.i.posthog.com';
  }

  if (normalizedRegion === 'eu' || normalizedRegion === 'eu1' || normalizedRegion === 'europe') {
    return 'https://eu.i.posthog.com';
  }

  return undefined;
}

const projectToken = readPublicEnv('EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN');
const projectId = readPublicEnv('EXPO_PUBLIC_POSTHOG_PROJECT_ID');
const projectRegion = readPublicEnv('EXPO_PUBLIC_POSTHOG_PROJECT_REGION');
const host = resolvePosthogHost(projectRegion);
const enabledFromEnv = readPublicEnv('EXPO_PUBLIC_POSTHOG_ENABLED') === 'true';

export const posthogConfig: PostHogConfig = {
  projectToken,
  projectId,
  projectRegion,
  host,
  enabled: enabledFromEnv,
};
