import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const redis = Redis.fromEnv();

// 2 checkout attempts per 5 minutes per IP
const checkoutLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, "5 m"),
  prefix: "ratelimit:checkout",
});

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Rate limit checkout endpoint
  if (path === "/api/checkout") {
    console.log(`[ratelimit:checkout]: Middleware hit.`);

    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    const { success, remaining, reset } = await checkoutLimiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Demasiados intentos de compra. Por favor, espera unos minutos.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/checkout"],
};
