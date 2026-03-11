'use client';

import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';
import { cn } from '@/lib/utils';

const Logo = ({ className, onClick }: { className?: string, onClick?: () => void }) => {
  const { logo } = placeholderImages;

  const image = (
    <Image
      src={logo.src}
      alt="Gamers' Night Challenge Logo"
      width={logo.width}
      height={logo.height}
      className={cn(className, onClick && "cursor-pointer")}
      data-ai-hint={logo.hint}
    />
  );
  
  if (onClick) {
    return (
        <button 
            onClick={onClick} 
            className={cn(
                "appearance-none bg-transparent border-none p-0 rounded-full",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            )}
            aria-label="Open Admin Dashboard"
        >
            {image}
        </button>
    )
  }

  return image;
};

export default Logo;
