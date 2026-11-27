import React from 'react';

interface AgencyLogoProps {
  logo?: string;
  logoUrl?: string;
  name?: string;
  className?: string;
  emojiClassName?: string;
}

const isImageSource = (value?: string): boolean => {
  if (!value) return false;
  const trimmed = value.trim();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('/')
  );
};

export const AgencyLogo: React.FC<AgencyLogoProps> = ({
  logo,
  logoUrl,
  name = 'Agency Logo',
  className = 'w-8 h-8 rounded-lg object-contain',
  emojiClassName = 'text-xl sm:text-2xl leading-none'
}) => {
  const imageSrc = isImageSource(logoUrl)
    ? logoUrl!.trim()
    : isImageSource(logo)
    ? logo!.trim()
    : '';

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={name}
        className={className}
      />
    );
  }

  return <span className={emojiClassName}>{logo || '🎬'}</span>;
};

