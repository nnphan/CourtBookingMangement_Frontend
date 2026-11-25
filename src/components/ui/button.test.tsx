import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Button } from './button';

describe('Button with asChild', () => {
  it.each([false, true])('renders its link with loading=%s', (loading) => {
    const markup = renderToStaticMarkup(
      <Button asChild loading={loading} className="custom-button">
        <a href="/dashboard">Dashboard</a>
      </Button>,
    );

    expect(markup).toMatch(/^<a\b/);
    expect(markup).toContain('href="/dashboard"');
    expect(markup).toContain('custom-button');
    expect(markup).toContain('Dashboard</a>');
    expect(markup.includes('animate-spin')).toBe(loading);
  });
});
