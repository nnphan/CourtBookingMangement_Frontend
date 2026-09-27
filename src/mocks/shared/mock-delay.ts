/**
 * Simulates realistic network latency for mock calls
 */
export function mockDelay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
