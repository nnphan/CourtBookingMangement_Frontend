/**
 * Generates an ASP.NET Core style trace ID for mock responses
 * Example: 0HNORLH33PS60:00000009
 */
export function generateTraceId(): string {
  const prefix = '0HNORLH33PS60';
  const suffix = Math.floor(Math.random() * 100000000)
    .toString(16)
    .padStart(8, '0')
    .toUpperCase();
  return `${prefix}:${suffix}`;
}
