import { APP_ROUTES } from "@/common/constants/routes";

export function resolvePostAuthRedirectPath(
  nextPath: string | null | undefined,
) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return APP_ROUTES.dashboard;
  }

  return nextPath.startsWith(APP_ROUTES.dashboard)
    ? nextPath
    : APP_ROUTES.dashboard;
}
