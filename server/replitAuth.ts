// blueprint:javascript_log_in_with_replit
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    try {
      const issuerUrl = process.env.ISSUER_URL ?? "https://replit.com/oidc";
      console.log(`[Auth] Discovering OIDC configuration from: ${issuerUrl}`);
      const config = await client.discovery(
        new URL(issuerUrl),
        process.env.REPL_ID!
      );
      console.log(`[Auth] OIDC discovery successful`);
      return config;
    } catch (error) {
      console.error("[Auth] OIDC discovery error:", error);
      throw error;
    }
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  
  // Add connection retry and timeout settings to handle DNS errors
  const connectionString = process.env.DATABASE_URL;
  const urlWithSettings = connectionString?.includes('?') 
    ? `${connectionString}&connect_timeout=10&keepalives=1&keepalives_idle=30`
    : `${connectionString}?connect_timeout=10&keepalives=1&keepalives_idle=30`;
  
  console.log('[Auth] Initializing PostgreSQL session store with retry settings...');
  
  const sessionStore = new pgStore({
    conString: urlWithSettings,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
    // Prevent the session store from crashing the app on connection errors
    errorLog: (error: any) => {
      // Log but don't throw - allows server to start even if DB connection is temporarily unavailable
      console.error('[Auth] PostgreSQL session store error (non-fatal):', error.message || error);
    },
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

// Track registered strategies dynamically
const registeredStrategies = new Set<string>();

// Test database connection
async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL!);
    
    console.log('[Auth] Testing database connection...');
    await sql`SELECT 1 as test`;
    console.log('[Auth] Database connection test successful');
    return true;
  } catch (error: any) {
    console.error('[Auth] Database connection test failed:', error.message || error);
    return false;
  }
}

export async function setupAuth(app: Express) {
  // Test database connection first to ensure it's accessible
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.warn('[Auth] WARNING: Database connection unavailable, but continuing anyway');
    // Don't throw - let the app start and retry connections later
  }
  
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      console.log("[Auth] Verifying tokens and creating user session");
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      console.log("[Auth] User session created successfully");
      verified(null, user);
    } catch (error) {
      console.error("[Auth] Error during token verification:", error);
      verified(error as Error);
    }
  };

  // Register initial domains from environment variable
  const initialDomains = process.env.REPLIT_DOMAINS!.split(",");
  console.log(`[Auth] Registering initial strategies for domains: ${initialDomains.join(", ")}`);
  
  for (const domain of initialDomains) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
    registeredStrategies.add(domain);
    console.log(`[Auth] Registered strategy: replitauth:${domain}`);
  }

  // Dynamic strategy registration function
  const registerStrategyForDomain = (domain: string) => {
    if (registeredStrategies.has(domain)) {
      console.log(`[Auth] Strategy already registered for: ${domain}`);
      return;
    }

    console.log(`[Auth] Dynamically registering strategy for new domain: ${domain}`);
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
    registeredStrategies.add(domain);
    console.log(`[Auth] Successfully registered strategy: replitauth:${domain}`);
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    const hostname = req.hostname;
    const strategyName = `replitauth:${hostname}`;
    
    console.log(`[Auth] Login attempt for hostname: ${hostname}`);
    console.log(`[Auth] Currently registered domains: ${Array.from(registeredStrategies).join(", ")}`);
    
    // Dynamically register strategy if not already registered
    if (!registeredStrategies.has(hostname)) {
      console.log(`[Auth] Domain not pre-registered, registering now: ${hostname}`);
      try {
        registerStrategyForDomain(hostname);
      } catch (error) {
        console.error(`[Auth] Failed to register strategy for ${hostname}:`, error);
        return res.status(500).json({ 
          error: "Failed to configure authentication for this domain",
          hostname: hostname
        });
      }
    }
    
    passport.authenticate(strategyName, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const hostname = req.hostname;
    
    // Ensure strategy is registered for this domain (in case callback comes before login)
    if (!registeredStrategies.has(hostname)) {
      console.log(`[Auth] Callback for unregistered domain, registering now: ${hostname}`);
      try {
        registerStrategyForDomain(hostname);
      } catch (error) {
        console.error(`[Auth] Failed to register strategy for ${hostname}:`, error);
        return res.status(500).send("Authentication configuration error");
      }
    }
    
    // Use custom callback with failWithError to catch errors from token exchange
    passport.authenticate(
      `replitauth:${hostname}`, 
      { 
        failWithError: true,
        successReturnToOrRedirect: "/",
      },
      (err: any, user: any, info: any) => {
        if (err) {
          console.error("[Auth] Callback error:", err);
          
          // Check if it's a temporary DNS error (EAI_AGAIN)
          const isTransientDnsError = 
            err.code === 'EAI_AGAIN' || 
            err.errno === 'EAI_AGAIN' ||
            err.message?.includes('EAI_AGAIN') || 
            err.message?.includes('getaddrinfo') ||
            err.message?.includes('helium');
          
          if (isTransientDnsError) {
            console.log("[Auth] Transient DNS error detected, redirecting to retry login");
            return res.redirect("/api/login");
          }
          
          // For other errors, show a friendly error page
          console.error("[Auth] Non-transient error:", err.message || err);
          return res.status(500).send(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Authentication Error - TymFlo Hub</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    background: #f5f5f5;
                  }
                  .container {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    max-width: 500px;
                    text-align: center;
                  }
                  h1 { color: #463176; margin: 0 0 1rem 0; }
                  p { color: #666; line-height: 1.6; }
                  button {
                    background: #463176;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    margin-top: 1rem;
                  }
                  button:hover { background: #362559; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>Authentication Error</h1>
                  <p>We encountered a temporary issue while signing you in. This usually resolves itself on retry.</p>
                  <p>Please try again:</p>
                  <button onclick="window.location.href='/api/login'">Try Again</button>
                  <br /><br />
                  <a href="/" style="color: #463176; text-decoration: none;">← Back to Home</a>
                </div>
              </body>
            </html>
          `);
        }
        
        // No error - log in the user
        if (user) {
          req.logIn(user, (loginErr) => {
            if (loginErr) {
              console.error("[Auth] Login error:", loginErr);
              return next(loginErr);
            }
            return res.redirect("/");
          });
        } else {
          // No user returned
          console.log("[Auth] No user returned, redirecting to login");
          return res.redirect("/api/login");
        }
      }
    )(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
