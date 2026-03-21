export type LandingNavItem =
  | { label: string; targetId: string; href?: never }
  | { label: string; href: string; targetId?: never };

export const landingNavItems: LandingNavItem[] = [
  { label: "Features", targetId: "features" },
  { label: "Solution", href: "/solution" },
  { label: "Pricing", targetId: "pricing" },
];
