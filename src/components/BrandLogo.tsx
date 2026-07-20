import Image from "next/image";

type BrandLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  size = 40,
  className = "",
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/igbobi-college-emblem.jpg"
      alt="Igbobi College emblem"
      width={size}
      height={size}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );
}
