// src/auth/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { cognitoConfig } from "./cognitoConfig";

const userPool = new CognitoUserPool({
  UserPoolId: cognitoConfig.UserPoolId,
  ClientId:   cognitoConfig.ClientId,
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — check if a user is already logged in (tokens in localStorage)
  useEffect(() => {
    const currentUser = userPool.getCurrentUser();
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Refresh the session — this validates stored tokens and gets a fresh one if needed
    currentUser.getSession((err, session) => {
      if (!err && session.isValid()) {
        setToken(session.getIdToken().getJwtToken());
      }
      setLoading(false);
    });
  }, []);

  // Redirects browser to Cognito's hosted login page
  function login() {
    const params = new URLSearchParams({
      client_id:     cognitoConfig.ClientId,
      response_type: "code",
      scope:         "openid email profile",
      redirect_uri:  cognitoConfig.RedirectUri,
    });
    window.location.href = `${cognitoConfig.Domain}/oauth2/authorize?${params}`;
  }

  function logout() {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) currentUser.signOut();
    setToken(null);

    const params = new URLSearchParams({
      client_id:  cognitoConfig.ClientId,
      logout_uri: "http://localhost:5173",
    });
    window.location.href = `${cognitoConfig.Domain}/logout?${params}`;
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}