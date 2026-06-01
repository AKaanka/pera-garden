import { useEffect, useState } from "react";
import { checkActiveAdmin } from "../services/supabase/auth";

type AdminAccessState = {
  loading: boolean;
  isAdmin: boolean;
  error: string;
};

export function useAdminAccess(isAuthenticated: boolean) {
  const [state, setState] = useState<AdminAccessState>({
    loading: isAuthenticated,
    isAdmin: false,
    error: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setState({
        loading: false,
        isAdmin: false,
        error: "",
      });
      return;
    }

    let active = true;

    setState({
      loading: true,
      isAdmin: false,
      error: "",
    });

    checkActiveAdmin()
      .then((isAdmin) => {
        if (active) {
          setState({
            loading: false,
            isAdmin,
            error: "",
          });
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            loading: false,
            isAdmin: false,
            error: error instanceof Error ? error.message : "Could not verify admin access.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  return state;
}
