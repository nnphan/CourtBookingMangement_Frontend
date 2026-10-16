import { useEffect, useState } from 'react';
import { getUserInitials } from '@/shared/utils/current-user';

interface CurrentUserAvatarProps {
  fullName?: string | null;
  avatarUrl?: string | null;
  className?: string;
}

export const CurrentUserAvatar = ({
  fullName,
  avatarUrl,
  className = '',
}: CurrentUserAvatarProps) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  return (
    <span
      aria-hidden="true"
      className={`bg-brand-100 text-brand-800 grid size-9 shrink-0 place-items-center overflow-hidden rounded-full text-xs font-bold ${className}`}
    >
      {avatarUrl && !imageFailed ? (
        <img
          src={avatarUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        getUserInitials(fullName)
      )}
    </span>
  );
};
