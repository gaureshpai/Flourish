import { NextResponse, NextRequest } from "next/server";
import { LRUCache } from "lru-cache";
import { nanoid } from "nanoid";

const RATE_LIMITER_USER_ID_COOKIE_NAME = "userUuid" as const;
const RATE_LIMITER_EXPIRY_DATE_COOKIE_NAME = "userUuid_expires" as const;

export type RateLimiterOptions = {
  uniqueTokenPerInterval?: number;
  interval?: number;
  getUserId: (req: NextRequest) => string; // Modified to use NextRequest
};

/**
 * Creates a rate limiter for App Router API routes.
 *
 * @param {Object} [options={}] - Configuration options.
 * @param {number} [options.interval=60000] - Duration for the rate limiting window in milliseconds. Default is 60000 ms.
 * @param {number} [options.uniqueTokenPerInterval=50] - Maximum number of unique tokens allowed per interval. Default is 50.
 * @param {Function} [options.getUserId] - Function to extract the user ID from the request.
 * @returns {Object} An object with a `check` method to enforce rate limiting.
 */
export function createRateLimiter(options?: RateLimiterOptions) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 50,
    ttl: options?.interval || 60000,
  });

  return {
    /**
     * Checks the rate limit for a request.
     *
     * @param {NextRequest} req - Next.js request object.
     * @param {number} limitPerHour - Allowed number of requests (Per hour).
     * @returns {Promise<{success: boolean, response?: NextResponse}>} A promise that resolves to an object with success status and response (if rate limited).
     */
    check: async (
      req: NextRequest,
      limitPerHour: number,
    ): Promise<{ success: boolean; response?: NextResponse }> => {
      try {
        const userId = options?.getUserId(req);
        if (!userId) {
          return {
            success: false,
            response: NextResponse.json(
              { error: "Token missing" },
              { status: 400 }
            )
          };
        }

        const token = `user:${userId}`;
        const tokenCount = (tokenCache.get(token) as number[]) || [0];

        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limitPerHour;

        const headers = new Headers();
        headers.set("X-RateLimit-Limit", limitPerHour.toString());
        headers.set("X-RateLimit-Remaining", isRateLimited ? "0" : (limitPerHour - currentUsage).toString());

        if (isRateLimited) {
          return {
            success: false,
            response: NextResponse.json(
              { error: "Rate limit exceeded" },
              { status: 429, headers }
            )
          };
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          response: NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
          )
        };
      }
    },
  };
}

/**
 * Gets a user ID from a request. Uses IP address and user agent when available,
 * otherwise falls back to cookies.
 */
export const getUserId = (req: NextRequest) => {
  const userIp = req.headers.get("x-forwarded-for") || req || "";
  const userAgent = req.headers.get("user-agent") || "";

  // If User has an userIp and userAgent return that
  if (userIp && userAgent) {
    return `${userIp}-${userAgent}`;
  }

  // Check cookies
  const cookies = req.cookies;
  const userIdCookie = cookies.get(RATE_LIMITER_USER_ID_COOKIE_NAME);
  const expiryCookie = cookies.get(RATE_LIMITER_EXPIRY_DATE_COOKIE_NAME);

  if (userIdCookie && expiryCookie) {
    const expiryDate = new Date(expiryCookie.value);

    // If user id has expired, we'll return a new ID
    if (expiryDate <= new Date()) {
      return nanoid(20);
    }

    return userIdCookie.value;
  }

  // If no userIp, userAgent and cookies can be found, generate a new ID
  return nanoid(20);
}

/**
 * Helper function to set cookies in the response
 */
export const setCookies = (response: NextResponse): NextResponse => {
  const userUuidToken = nanoid(20);

  // Set the user ID cookie
  response.cookies.set({
    name: RATE_LIMITER_USER_ID_COOKIE_NAME,
    value: userUuidToken,
    maxAge: 60 * 60 * 24, // 24 hours
    sameSite: "strict",
  });

  // Set the expiry date cookie
  const newExpirationDate = new Date();
  newExpirationDate.setSeconds(newExpirationDate.getSeconds() + 60 * 60 * 24);
  response.cookies.set({
    name: RATE_LIMITER_EXPIRY_DATE_COOKIE_NAME,
    value: newExpirationDate.toUTCString(),
    maxAge: 60 * 60 * 24, // 24 hours
    sameSite: "strict",
  });

  return response;
}