import type { ZodType } from "zod";
import type {
  RegistryEntry,
  RegistryExample,
  RegistryExampleDetail,
  RegistryItemDetail,
} from "../domain/registry.js";
import {
  ExampleComponentSchema,
  ExampleDetailSchema,
  RegistryItemDetailSchema,
  RegistryResponseSchema,
} from "./schemas.js";
import { RegistryFetchError, RegistryParseError } from "./errors.js";

const REGISTRY_URL = "https://magicui.design/registry.json";
const REGISTRY_ITEM_URL = "https://magicui.design/r";
const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheRecord<T> = {
  value?: T;
  expiresAt?: number;
  inflight?: Promise<T>;
};

const registryEntriesCache: CacheRecord<RegistryEntry[]> = {};
const registryItemDetailsCache = new Map<string, CacheRecord<RegistryItemDetail>>();

function isCacheFresh<T>(cache: CacheRecord<T>): cache is CacheRecord<T> & {
  value: T;
  expiresAt: number;
} {
  return cache.value !== undefined && (cache.expiresAt ?? 0) > Date.now();
}

async function readThroughCache<T>(
  cache: CacheRecord<T>,
  loader: () => Promise<T>,
): Promise<T> {
  if (isCacheFresh(cache)) {
    return cache.value;
  }

  if (cache.inflight) {
    return cache.inflight;
  }

  cache.inflight = loader()
    .then((value) => {
      cache.value = value;
      cache.expiresAt = Date.now() + CACHE_TTL_MS;
      return value;
    })
    .finally(() => {
      cache.inflight = undefined;
    });

  return cache.inflight;
}

async function fetchJson<T>(
  url: string,
  schema: ZodType<T>,
  errorLabel: string,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url);
  } catch (error) {
    throw new RegistryFetchError(`Failed to fetch ${errorLabel}`, {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new RegistryFetchError(
      `Failed to fetch ${errorLabel}: ${response.statusText} (Status: ${response.status})`,
    );
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch (error) {
    throw new RegistryParseError(`Failed to parse ${errorLabel} JSON`, {
      cause: error,
    });
  }

  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new RegistryParseError(`Invalid ${errorLabel} response`, {
      cause: parsed.error,
    });
  }

  return parsed.data;
}

export async function fetchRegistry() {
  return fetchJson(REGISTRY_URL, RegistryResponseSchema, "registry.json");
}

export async function fetchRegistryEntries(): Promise<RegistryEntry[]> {
  return readThroughCache(registryEntriesCache, async () => {
    const registry = await fetchRegistry();
    return registry.items;
  });
}

export async function fetchRegistryItemDetails(
  name: string,
): Promise<RegistryItemDetail> {
  const cachedDetail = registryItemDetailsCache.get(name) ?? {};
  registryItemDetailsCache.set(name, cachedDetail);

  return readThroughCache(cachedDetail, () =>
    fetchJson(
      `${REGISTRY_ITEM_URL}/${name}`,
      RegistryItemDetailSchema,
      `registry item ${name}`,
    ),
  );
}

export function parseExampleComponents(entries: RegistryEntry[]): RegistryExample[] {
  return entries.flatMap((item) => {
    if (item.type !== "registry:example") {
      return [];
    }

    const parsedExample = ExampleComponentSchema.safeParse({
      name: item.name,
      type: item.type,
      description: item.description,
      registryDependencies: item.registryDependencies,
    });

    return parsedExample.success ? [parsedExample.data] : [];
  });
}

export async function fetchExampleDetails(
  exampleName: string,
): Promise<RegistryExampleDetail> {
  return fetchJson(
    `${REGISTRY_ITEM_URL}/${exampleName}`,
    ExampleDetailSchema,
    `example ${exampleName}`,
  );
}

export function clearRegistryClientCache() {
  registryEntriesCache.value = undefined;
  registryEntriesCache.expiresAt = undefined;
  registryEntriesCache.inflight = undefined;
  registryItemDetailsCache.clear();
}
