export const navItems = [
  { href: "/", label: "Overview" },
  { href: "/incidents", label: "Incidents" },
  { href: "/services", label: "Services" },
  { href: "/metrics", label: "Metrics" },
  { href: "/logs", label: "Live Logs" },
  { href: "/ai-analysis", label: "AI Analysis" },
  { href: "/deployments", label: "Deployments" },
  { href: "/postmortems", label: "Postmortems" },
  { href: "/settings", label: "Settings" },
];

export function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
