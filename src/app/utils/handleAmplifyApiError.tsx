export function handleAmplifyApiError(caught: unknown) {
    if (caught != null &&
        typeof caught === 'object' &&
        'errors' in caught && caught?.errors instanceof Array) {
        console.error(...caught.errors)
        throw new Error(caught.errors[0].message)
    }
    console.error(caught)
    throw new Error("Unknown error");
}