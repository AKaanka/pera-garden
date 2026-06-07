type FunctionsHttpErrorLike = {
  context?: {
    json?: () => Promise<unknown>;
  };
};

export function hasBooleanOk(value: unknown): value is { ok: boolean } {
  if (!value || typeof value !== "object" || !("ok" in value)) {
    return false;
  }

  return typeof (value as { ok: unknown }).ok === "boolean";
}

export async function parseFunctionError<TResponse>(
  error: unknown,
  isResponse: (value: unknown) => value is TResponse,
): Promise<TResponse | null> {
  const context = (error as FunctionsHttpErrorLike).context;
  const responseJson = context?.json;

  if (!responseJson) {
    return null;
  }

  const body = await responseJson.call(context).catch(() => null);

  return isResponse(body) ? body : null;
}
