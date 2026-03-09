import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include",
        });
        if (!response.ok) {
          return null as unknown as User;
        }
        return await response.json();
      } catch {
        return null as unknown as User;
      }
    },
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
  };
}
