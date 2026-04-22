export const PROTECTED_ROUTES = [
  "/employer",
  "/profile",
  "/settings",
  "/jobs/apply",
  "/admin",
];

export const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
};
