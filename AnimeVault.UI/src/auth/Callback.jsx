// src/auth/Callback.jsx
import { useEffect, useState, useRef } from "react";
import { CognitoUserPool } from "amazon-cognito-identity-js";
import { cognitoConfig } from "./cognitoConfig";

const userPool = new CognitoUserPool({
  UserPoolId: cognitoConfig.UserPoolId,
  ClientId:   cognitoConfig.ClientId,
});

export default function Callback() {
  const [error, setError] = useState(null);
  const hasRun            = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const code   = params.get("code");
    const err    = params.get("error");

    // Handle errors that Cognito sends back in the URL itself
    if (err) {
      setError(params.get("error_description") ?? err);
      return;
    }

    if (!code) {
      setError("No authorisation code found in URL.");
      return;
    }

    // Exchange the code for tokens at Cognito's token endpoint
    fetch(`${cognitoConfig.Domain}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:   "authorization_code",
        client_id:    cognitoConfig.ClientId,
        code,
        redirect_uri: cognitoConfig.RedirectUri,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error_description ?? data.error);

        // Store tokens the same way the SDK expects them
        const key = `CognitoIdentityServiceProvider.${cognitoConfig.ClientId}`;
        const username = parseJwt(data.id_token)["cognito:username"];
        localStorage.setItem(`${key}.LastAuthUser`, username);
        localStorage.setItem(`${key}.${username}.idToken`, data.id_token);
        localStorage.setItem(`${key}.${username}.accessToken`, data.access_token);
        localStorage.setItem(`${key}.${username}.refreshToken`, data.refresh_token);

        // Replace the URL so the ?code= param is gone before we navigate away
        window.history.replaceState({}, document.title, "/callback");
        window.location.href = "/";
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div style={{ padding: "2rem", color: "#fff", fontFamily: "sans-serif" }}>
        <p style={{ color: "#ff6b6b" }}>Auth error: {error}</p>
        <a href="/" style={{ color: "#aaa", fontSize: "0.85rem" }}>Back to home</a>
      </div>
    );
  }
  return <p style={{ padding: "2rem", color: "#ffffff" }}>Signing you in...</p>;
}

function parseJwt(token) {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
}