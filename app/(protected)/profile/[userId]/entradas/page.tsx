import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Ticket } from "lucide-react";

interface EntradasPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function EntradasPage({ params }: EntradasPageProps) {
  // Secure authentication - validates with server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { userId } = await params;

  // Verify the logged-in user matches the profile being viewed
  if (session.user.id !== userId) {
    redirect("/profile");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Ticket className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Mis Entradas</CardTitle>
          <CardDescription className="text-base">
            Sección en desarrollo
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Esta sección está siendo migrada a nuestra nueva arquitectura.
            <br />
            Próximamente podrás ver y gestionar tus entradas aquí.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
