'use client';

import * as React from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Create a context to hold the authentication state
const AuthContext = React.createContext<{ user: User | null }>({ user: null });

// This component will wrap our application and provide user context
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Check if user is authorized
      if (currentUser && currentUser.email !== 'inno.inkin@gmail.com') {
        // Unauthorized user - sign them out
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'You are not authorized to access this application.',
        });
        await signOut(auth);
        setUser(null);
        setLoading(false);
        router.push('/login');
        return;
      }

      setUser(currentUser);
      setLoading(false);

      const isLoginPage = window.location.pathname === '/login';

      if (!currentUser && !isLoginPage) {
        // If the user is not logged in and not on the login page, redirect them.
        router.push('/login');
      } else if (currentUser && isLoginPage) {
        // If the user is logged in and on the login page, redirect to home.
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router, toast]); // Added toast to dependencies

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent rendering children if user is not authenticated and we are not on the login page
  if (!user && pathname !== '/login') {
      return null;
  }

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

// Custom hook to easily access the user from any component
export const useAuth = () => {
  return React.useContext(AuthContext);
};
