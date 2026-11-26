// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { PersonalizedMatchFilters } from './PersonalizedMatchFilters';

const mocks = vi.hoisted(() => ({
  profile: vi.fn(),
  branchId: '00000000-0000-0000-0000-000000000001',
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/features/branches/api/branch.query', () => ({
  useBranches: () => ({
    data: { branches: [{ id: mocks.branchId, name: 'Test branch', isActive: true }] },
  }),
}));
vi.mock('../hooks/usePlayerMatching', () => ({
  usePlayerMatchingProfile: mocks.profile,
  usePlayerMatchPreferences: () => ({}),
}));

afterEach(cleanup);

it('synchronizes weight inputs, disables invalid searches, and resets the defaults', () => {
  mocks.profile.mockReturnValue({ data: { isMatchingEnabled: true } });
  render(
    <MemoryRouter>
      <PersonalizedMatchFilters isAuthenticated isSearching={false} onSearch={vi.fn()} />
    </MemoryRouter>,
  );
  const skill = 'playerMatch.scoring.weights.skill';
  const slider = screen.getByRole<HTMLInputElement>('slider', { name: skill });
  const number = screen.getByRole<HTMLInputElement>('spinbutton', { name: skill });
  const submit = screen.getByRole<HTMLButtonElement>('button', {
    name: 'playerMatch.scoring.search',
  });

  expect(slider.value).toBe('40');
  expect(submit.disabled).toBe(false);
  fireEvent.change(slider, { target: { value: '50' } });
  expect(number.value).toBe('50');
  expect(submit.disabled).toBe(true);
  fireEvent.change(number, { target: { value: '60' } });
  expect(slider.value).toBe('60');
  fireEvent.click(screen.getByRole('button', { name: 'playerMatch.scoring.resetWeights' }));
  expect(number.value).toBe('40');
  expect(submit.disabled).toBe(false);
});

it('submits a search without a matching profile and sends the selected filters', () => {
  mocks.profile.mockReturnValue({
    isError: true,
    error: { status: 404, code: 'PLAYER_MATCHING_PROFILE_REQUIRED' },
  });
  const search = vi.fn();
  render(
    <MemoryRouter>
      <PersonalizedMatchFilters isAuthenticated isSearching={false} onSearch={search} />
    </MemoryRouter>,
  );

  const submit = screen.getByRole('button', { name: 'playerMatch.scoring.search' });
  fireEvent.click(submit);
  expect(search).toHaveBeenLastCalledWith({
    branchIds: [],
    keyword: undefined,
    startTime: undefined,
    endTime: undefined,
    preferences: { skillWeight: 40, timeWeight: 30, branchWeight: 20, genderWeight: 10 },
    saveAsDefault: false,
    page: 1,
    pageSize: 9,
  });

  for (const [label, value] of [
    ['keyword', '  Doubles  '],
    ['matchDate', '2026-12-04'],
    ['startTime', '18:00'],
    ['endTime', '20:00'],
    ['branch', mocks.branchId],
    ['skillLevel', 'ADVANCED'],
    ['genderPreference', 'BOTH'],
  ]) {
    fireEvent.change(screen.getByLabelText(`playerMatch.filters.${label}`), { target: { value } });
  }
  fireEvent.click(submit);
  expect(search).toHaveBeenLastCalledWith(
    expect.objectContaining({
      keyword: 'Doubles',
      matchDate: '2026-12-04',
      startTime: '18:00',
      endTime: '20:00',
      branchIds: [mocks.branchId],
      skillLevel: 'ADVANCED',
      genderPreference: 'BOTH',
    }),
  );
});
