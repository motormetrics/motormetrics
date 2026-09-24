import { redis } from "@motormetrics/utils/redis";

export interface MaintenanceConfig {
  enabled: boolean;
  message: string;
}

/** The shape of the Redis `config` key; maintenance is one section of it. */
interface AppConfig {
  maintenance: MaintenanceConfig;
}

/**
 * Reads the maintenance section of the Redis `config` key, defaulting to off.
 *
 * Redis errors are thrown so each caller can choose its own fallback.
 */
export async function readMaintenanceConfig(): Promise<MaintenanceConfig> {
  const config = await redis.get<AppConfig>("config");

  return config?.maintenance ?? { enabled: false, message: "" };
}

/**
 * Replaces the maintenance section of the Redis `config` key, leaving the
 * rest of the config untouched. Redis errors are thrown to the caller.
 */
export async function writeMaintenanceConfig(
  maintenance: MaintenanceConfig,
): Promise<void> {
  const currentConfig =
    (await redis.get<AppConfig>("config")) ??
    ({ maintenance: { enabled: false, message: "" } } satisfies AppConfig);

  currentConfig.maintenance = maintenance;

  await redis.set("config", currentConfig);
}
