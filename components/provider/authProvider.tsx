"use client";
import React, { ReactNode, useEffect } from "react";
import { useAppDispatch } from "@/lib/hook/hook";
import { setUser, clearUser, setLoading } from "@/lib/features/user/userSlice";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // On hard reload, Redux resets to its empty initial state.
    // Re-fetch the session from the server using the existing HttpOnly cookie.
    async function rehydrateAuth() {
      dispatch(setLoading());
      try {
        const res = await fetch("/api/user", {
          method: "GET",
          credentials: "include", // send the auth cookie automatically
        });

        //console.log("1. authProvider : ", res);

        if (!res.ok) {
          //console.log("response is not okey");
          // No valid session — ensure store is clean
          dispatch(clearUser());
          return;
        }

        const data = await res.json();
        //console.log("authProvider :  data", data);

        if (data.success && data.user) {
          dispatch(
            setUser({
              id: data.user.id ?? "",
              name: data.user.name ?? "",
              role: data.user.role ?? "",
              loading: false,
            }),
          );
        } else {
          dispatch(clearUser());
        }
      } catch {
        // Network error or server down — clear to be safe
        dispatch(clearUser());
      }
    }

    rehydrateAuth();
  }, []); // runs once on mount (i.e. on every hard reload)

  return <>{children}</>;
}
