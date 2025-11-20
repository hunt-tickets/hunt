"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Tablet, Loader2, LogOut } from "lucide-react";
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
  const [revokingToken, setRevokingToken] = useState<string | null>(null);
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

  const handleRevokeSession = async (token: string) => {
    setRevokingToken(token);
    try {
      const { error } = await authClient.revokeSession({ token });

      if (error) {
        console.error("Error revoking session:", error);
        toast.error("Error al cerrar la sesión");
        return;
      }

      toast.success("Sesión cerrada exitosamente");
      await loadSessions();
    } catch (error) {
      console.error("Error revoking session:", error);
      toast.error("Error al cerrar la sesión");
    } finally {
      setRevokingToken(null);
    }
  };

  const getDeviceIcon = (deviceType: "desktop" | "mobile" | "tablet") => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="h-5 w-5" />;
      case "tablet":
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Dispositivos Activos
          </CardTitle>
          <CardDescription>
            Sesiones activas en diferentes dispositivos
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Dispositivos Activos
        </CardTitle>
        <CardDescription>
          Sesiones activas en diferentes dispositivos ({sessions.length})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session) => {
            const parsed = parseUserAgent(session.userAgent);
            const isCurrentSession = currentSession?.session?.token === session.token;

            return (
              <div
                key={session.id}
                className="flex items-start justify-between p-4 rounded-lg border border-[#303030] bg-background/30"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getDeviceIcon(parsed.deviceType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{parsed.deviceName}</p>
                      {isCurrentSession && (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-500 border-green-500/20 text-xs"
                        >
                          Este dispositivo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {parsed.browser} {parsed.browserVersion}
                    </p>
                    {session.ipAddress && (
                      <p className="text-xs text-muted-foreground">
                        {session.ipAddress}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatSessionTime(new Date(session.createdAt))}
                    </p>
                  </div>
                </div>
                {!isCurrentSession && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeSession(session.token)}
                    disabled={revokingToken === session.token}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                  >
                    {revokingToken === session.token ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar sesión
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
