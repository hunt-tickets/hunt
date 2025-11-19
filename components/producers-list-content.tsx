"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface Producer {
  id: string;
  name: string | null;
  logo: string | null;
}

interface ProducersListContentProps {
  producers: Producer[];
  userId: string;
}

export function ProducersListContent({ producers, userId }: ProducersListContentProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Producers Section */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Productores</h3>
          <p className="text-sm text-muted-foreground">
            {producers.length} productor{producers.length !== 1 ? "es" : ""} registrado
            {producers.length !== 1 ? "s" : ""}
          </p>
        </div>

        {producers.length === 0 ? (
          <Card className="bg-white/[0.02] border-white/5">
            <CardContent className="py-12 text-center">
              <Users className="h-10 w-10 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1 text-white">
                No hay productores registrados
              </h3>
              <p className="text-sm text-white/40">
                Los productores aparecerán aquí cuando sean creados
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {producers.map((producer) => {
              const displayName = producer.name || "Sin nombre";

              return (
                <Card
                  key={producer.id}
                  onClick={() => router.push(`/profile/${userId}/administrador/marcas/${producer.id}`)}
                  className="group relative overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer"
                >
                  <CardContent className="relative pt-8 pb-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4">
                        {producer.logo ? (
                          <img
                            src={producer.logo}
                            alt={displayName}
                            className="w-20 h-20 rounded-xl object-cover ring-2 ring-white/10 group-hover:ring-white/15 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-white/15 transition-all duration-300">
                            <Users className="h-10 w-10 text-primary" />
                          </div>
                        )}
                      </div>

                      <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors duration-300">
                        {displayName}
                      </h4>
                      <p className="text-sm text-white/40 font-medium">Productor</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
