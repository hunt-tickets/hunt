"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { parseUserAgent, formatSessionTime } from "@/lib/utils/session-parser";
import { toast } from "sonner";

interface Session {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function ActiveSessionsCard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [revokingToken, setRevokingToken] = useState<string | null>(null);
  const { data: currentSession } = authClient.useSession();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await authClient.listSessions();

      if (error) {
        console.error("Error loading sessions:", error);
        toast.error("Error al cargar las sesiones");
        return;
      }

      if (data) {
        setSessions(data as Session[]);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast.error("Error al cargar las sesiones");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleRevokeSession = async (token: string) => {
  //   setRevokingToken(token);
  //   try {
  //     const { error } = await authClient.revokeSession({ token });

  //     if (error) {
  //       console.error("Error revoking session:", error);
  //       toast.error("Error al cerrar la sesión");
  //       return;
  //     }

  //     toast.success("Sesión cerrada exitosamente");
  //     await loadSessions();
  //   } catch (error) {
  //     console.error("Error revoking session:", error);
  //     toast.error("Error al cerrar la sesión");
  //   } finally {
  //     setRevokingToken(null);
  //   }
  // };

  const getDeviceIcon = (deviceType: "desktop" | "mobile" | "tablet") => {
    switch (deviceType) {
      case "mobile":
        return (
          <svg className="h-12 w-12" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  style={{ stopColor: "#3b3b3b", stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#1a1a1a", stopOpacity: 1 }}
                />
              </linearGradient>
              <filter id="phoneShadow">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="2"
                  floodOpacity="0.3"
                />
              </filter>
            </defs>
            {/* Phone body */}
            <rect
              x="14"
              y="4"
              width="20"
              height="40"
              rx="3"
              fill="url(#phoneGrad)"
              filter="url(#phoneShadow)"
            />
            <rect
              x="14.5"
              y="4.5"
              width="19"
              height="39"
              rx="2.5"
              stroke="#4a4a4a"
              strokeWidth="0.5"
            />
            {/* Screen */}
            <rect x="16" y="8" width="16" height="28" rx="1.5" fill="#0a0a0a" />
            {/* Home indicator */}
            <rect
              x="21"
              y="38"
              width="6"
              height="1.5"
              rx="0.75"
              fill="#4a4a4a"
            />
          </svg>
        );
      case "tablet":
        return (
          <svg className="h-12 w-12" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="tabletGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  style={{ stopColor: "#3b3b3b", stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#1a1a1a", stopOpacity: 1 }}
                />
              </linearGradient>
              <filter id="tabletShadow">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="2"
                  floodOpacity="0.3"
                />
              </filter>
            </defs>
            {/* Tablet body */}
            <rect
              x="8"
              y="6"
              width="32"
              height="36"
              rx="3"
              fill="url(#tabletGrad)"
              filter="url(#tabletShadow)"
            />
            <rect
              x="8.5"
              y="6.5"
              width="31"
              height="35"
              rx="2.5"
              stroke="#4a4a4a"
              strokeWidth="0.5"
            />
            {/* Screen */}
            <rect x="10" y="9" width="28" height="30" rx="1.5" fill="#0a0a0a" />
            {/* Home button */}
            <circle cx="24" cy="41" r="1" fill="#4a4a4a" />
          </svg>
        );
      default:
        return (
          <svg className="h-12 w-12" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient
                id="monitorGrad"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: "#2a2a2a", stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#1a1a1a", stopOpacity: 1 }}
                />
              </linearGradient>
              <filter id="monitorShadow">
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="3"
                  floodOpacity="0.4"
                />
              </filter>
            </defs>
            {/* Monitor screen */}
            <rect
              x="4"
              y="6"
              width="40"
              height="26"
              rx="2"
              fill="url(#monitorGrad)"
              filter="url(#monitorShadow)"
            />
            <rect
              x="4.5"
              y="6.5"
              width="39"
              height="25"
              rx="1.5"
              stroke="#3a3a3a"
              strokeWidth="0.5"
            />
            {/* Screen display - Matte Black */}
            <rect x="6" y="8" width="36" height="22" rx="1" fill="#0a0a0a" />
            {/* Stand */}
            <path d="M 20 32 L 22 36 L 26 36 L 28 32 Z" fill="#2a2a2a" />
            <rect x="16" y="36" width="16" height="2" rx="1" fill="#2a2a2a" />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const parsed = parseUserAgent(session.userAgent);
        const isCurrentSession =
          currentSession?.session?.token === session.token;

        return (
          <div
            key={session.id}
            className="flex items-start justify-between p-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a] hover:bg-[#202020] transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0 text-muted-foreground mt-1">
                {getDeviceIcon(parsed.deviceType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-medium">{parsed.deviceName}</p>
                  {isCurrentSession && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 border-green-500/20"
                    >
                      Este dispositivo
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    {parsed.browser} {parsed.browserVersion}
                  </p>
                  <p>
                    {session.ipAddress && `${session.ipAddress} (Bogotá, CO)`}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                {formatSessionTime(new Date(session.createdAt))}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
