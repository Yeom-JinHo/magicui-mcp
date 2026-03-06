export type RegistryErrorCode =
  | "FETCH_FAILED"
  | "INVALID_RESPONSE"
  | "ITEM_NOT_FOUND";

export class RegistryClientError extends Error {
  readonly code: RegistryErrorCode;

  constructor(
    code: RegistryErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "RegistryClientError";
    this.code = code;
  }
}

export class RegistryFetchError extends RegistryClientError {
  constructor(message: string, options?: ErrorOptions) {
    super("FETCH_FAILED", message, options);
    this.name = "RegistryFetchError";
  }
}

export class RegistryParseError extends RegistryClientError {
  constructor(message: string, options?: ErrorOptions) {
    super("INVALID_RESPONSE", message, options);
    this.name = "RegistryParseError";
  }
}

export class RegistryItemNotFoundError extends RegistryClientError {
  constructor(itemName: string, options?: ErrorOptions) {
    super(
      "ITEM_NOT_FOUND",
      `Registry item "${itemName}" was not found in the Magic UI registry.`,
      options,
    );
    this.name = "RegistryItemNotFoundError";
  }
}
