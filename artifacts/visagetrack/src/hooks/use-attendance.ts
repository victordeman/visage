import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authHeaders } from "@/lib/utils";

export function useAttendanceList() {
  return useQuery({
    queryKey: ["/api/attendance"],
    queryFn: async () => {
      const res = await fetch("/api/attendance", { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return res.json();
    }
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { userId: number; status: string }) => {
      const res = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to mark attendance");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/stats"] });
    }
  });
}

export function useFaceMatch() {
  return useMutation({
    mutationFn: async (descriptor: number[]) => {
      const res = await fetch("/api/users/face-match", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ descriptor })
      });
      if (!res.ok) throw new Error("Face match failed");
      return res.json();
    }
  });
}
