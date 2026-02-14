import { useSession } from "@/components/ctx";

export function useHasPermission(permission: string | string[]) {
  const { user } = useSession();

  if (!user || !user.permissions) {
    return false;
  }

  // Admin always has all permissions
  if (user.roles?.includes("admin")) {
    return true;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];

  return permissions.some((p) => user.permissions.includes(p));
}
