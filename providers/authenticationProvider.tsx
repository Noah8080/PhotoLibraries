import { Session, User } from "@supabase/supabase-js";
import { PropsWithChildren, useContext, createContext, useState, useEffect } from "react";
import { supabase } from "~/utils/supabase";

// create an authentication context to wrap the app in


// create a context for the authentication
type AuthenticationContextType = {
    session: Session | null;
    user: User | undefined;
};

// set default values for the session and user context to null
const AuthenticationContext = createContext<AuthenticationContextType>({
    session: null,
    user: undefined,
});

export default function AuthenticationContextProvider({ children }: PropsWithChildren) {
    
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })
  
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })
    }, [])
    
    
    return (
        // export the session and user data to the app
        <AuthenticationContext.Provider value={{session, user: session?.user}}>
            {children}
        </AuthenticationContext.Provider>
    );
}

export const useAuthentication = () => {
    return useContext(AuthenticationContext);
}