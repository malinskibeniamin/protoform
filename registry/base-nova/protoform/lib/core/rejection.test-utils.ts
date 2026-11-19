export async function captureRejection(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('Expected the operation to reject.');
}

export async function captureRejectionMessage(promise: Promise<unknown>) {
  const error = await captureRejection(promise);
  if (!(error instanceof Error)) {
    throw new TypeError('Expected an Error rejection.', { cause: error });
  }
  return error.message;
}
