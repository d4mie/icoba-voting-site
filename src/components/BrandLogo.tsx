import Image from "next/image";

type BrandLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
  /** Use "zbk" for the black-background emblem on auth pages */
  variant?: "default" | "zbk";
};

export function BrandLogo({
  size = 40,
  className = "",
  priority = false,
  variant = "default",
}: BrandLogoProps) {
  const src =
    variant === "zbk"
      ? "/igbobi-college-emblem-zbk.jpg"
      : "/igbobi-college-emblem.jpg";

  return (
    <Image
      src={src}
      alt="Igbobi College emblem"
      width={size}
      height={size}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );
}
