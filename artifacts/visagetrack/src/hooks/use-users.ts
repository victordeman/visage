import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authHeaders } from "@/lib/utils";

export function useUsersList() {
  return useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users", { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    }
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ["/api/users/stats"],
    queryFn: async () => {
      const res = await fetch("/api/users/stats", { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    }
  });
}

export function useEnrollUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/users/enroll", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Enrollment failed" }));
        throw new Error(error.message || "Enrollment failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    }
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    }
  });
}
