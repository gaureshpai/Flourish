import { NextRequest, NextResponse } from "next/server";
import { ValidationError } from "yup";
import { createRateLimiter, getUserId, setCookies } from "@/utility/rate-limiter";
import { mail } from "@/utility/mail";
import { mailValidationSchema, type MailRequestBody } from "./validation";

const REQUEST_PER_HOUR = 5 as const;
const RATELIMIT_DURATION = 3600000 as const; // 1 hour in milliseconds
const MAX_USER_PER_SECOND = 100 as const;

/*
  Rate Limiting Strategy:

  WARNING: This rate limiting strategy uses a combination of client IP address and user agent for identification.
  - Pros: Provides a more robust identification mechanism.
  - Cons:
    - This approach fails if we have multiple servers running as the LRU cache is bound to server's local memory which is fine for small apps which do not require to scale
    - Users behind certain proxies or networks might share the same IP address.
    - Determined attackers can still potentially circumvent these measures.
    - Privacy concerns: Collecting IP addresses and user agents may raise privacy considerations.
  
  If either the client's IP address or user agent is missing, a fallback mechanism defaults to using a UUID stored in cookies.
  - Pros: Ensures a default identification mechanism is in place.
  - Cons: UUIDs may not be entirely foolproof and can be manipulated by users.

  Always consider the privacy implications of collecting and using such information. Be transparent with users about the data you collect for rate limiting purposes.
*/
const limiter = createRateLimiter({
    interval: RATELIMIT_DURATION,
    uniqueTokenPerInterval: MAX_USER_PER_SECOND,
    getUserId,
});

export async function POST(request: NextRequest) {
    try {
        // Parse the request body
        const body: MailRequestBody = await request.json();

        // Check rate limiting
        const { success, response } = await limiter.check(request, REQUEST_PER_HOUR);
        if (!success) {
            return response; // Returns the pre-configured rate limit exceeded response
        }

        // Validate the request body
        try {
            await mailValidationSchema.validate(body, { abortEarly: false });
        } catch (validationError) {
            if (validationError instanceof ValidationError) {
                return NextResponse.json(
                    { status: 422, message: validationError.errors },
                    { status: 422 }
                );
            } else {
                return NextResponse.json(
                    { status: 500, message: "Internal server error" },
                    { status: 500 }
                );
            }
        }

        // Process the mail
        const { name, email, subject, message } = body;
        const mailResponse = await mail(name, email, subject, message);

        // Create response and add cookies if needed
        const successResponse = NextResponse.json(mailResponse, { status: mailResponse.status });
        return setCookies(successResponse);

    } catch (error: any) {
        if (error?.status === 429) {
            return NextResponse.json(
                { status: 429, message: "Rate limit exceeded" },
                { status: 429 }
            );
        } else {
            return NextResponse.json(
                {
                    status: error.status || 500,
                    message: error.message || "Internal server error"
                },
                { status: error.status || 500 }
            );
        }
    }
}