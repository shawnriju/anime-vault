export const cognitoConfig = {
  UserPoolId:  import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId:    import.meta.env.VITE_COGNITO_CLIENT_ID,
  Domain:      import.meta.env.VITE_COGNITO_DOMAIN,
  RedirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
};