'use client';

import * as React from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User is signed in, redirect to the main page.
        router.push('/');
      }
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the redirect.
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };
  
  // If user is already determined to be logged in, show nothing while redirecting.
  if (user) {
    return null; 
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="p-8 rounded-lg border bg-card shadow-lg flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <p className="text-muted-foreground mb-6">Please sign in to continue.</p>
        <Button onClick={signInWithGoogle} size="lg">
          <Chrome className="mr-2 h-5 w-5" />
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
