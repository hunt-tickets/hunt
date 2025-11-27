import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const redis = Redis.fromEnv();

// 5 checkout attempts per 10 minutes per IP
const checkoutLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "ratelimit:checkout",
});

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Rate limit checkout endpoint
  if (path === "/api/checkout") {
    const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "unknown";

    const { success, remaining, reset } = await checkoutLimiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Demasiados intentos de compra. Por favor, espera unos minutos."
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/checkout"],
};
