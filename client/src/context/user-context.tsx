import { createContext, useContext, useState, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  displayName?: string;
  progress: number;
  preferredLanguage: string;
  targetLanguage: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { isLoading } = useQuery({
    queryKey: ["/api/me"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/me", {
          credentials: "include",
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          return userData;
        }
        
        return null;
      } catch (error) {
        return null;
      }
    },
    enabled: false, // Only run when explicitly invoked
    staleTime: Infinity,
  });
  
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/login", credentials);
      return await response.json();
    },
    onSuccess: (userData) => {
      setUser(userData);
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.displayName || userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const registerMutation = useMutation({
    mutationFn: async (userData: { username: string; password: string; displayName?: string }) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return await response.json();
    },
    onSuccess: (userData) => {
      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully!",
      });
      // Auto-login after registration
      loginMutation.mutate({
        username: userData.username,
        password: userData.password,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };
  
  const register = async (username: string, password: string, displayName?: string) => {
    await registerMutation.mutateAsync({ username, password, displayName });
  };
  
  const logout = () => {
    setUser(null);
    queryClient.clear();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };
  
  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
