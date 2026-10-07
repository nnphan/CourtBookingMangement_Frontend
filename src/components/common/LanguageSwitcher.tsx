import { LanguageSwitcher as SharedLanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import type { LanguageSwitcherProps } from '@/shared/components/LanguageSwitcher';

export const LanguageSwitcher = (props: LanguageSwitcherProps) => {
  return <SharedLanguageSwitcher {...props} />;
};

export default LanguageSwitcher;
