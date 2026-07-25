"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { auth, firebaseConfigured } from "@/lib/firebase";

type AdminGuardProps = {
  children: ReactNode;
};

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setChecking(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/admin/login");
        return;
      }

      setUser(currentUser);
      setChecking(false);
    });

    return unsubscribe;
  }, [router]);

  if (!firebaseConfigured) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50">
        <p className="font-bold text-slate-600">Checking admin access...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
