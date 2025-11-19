"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Smartphone, ChevronLeft, ChevronRight } from "lucide-react";

interface QRCode {
  id: string;
  svg: string;
  scan: boolean;
  apple: string | null;
  google: string | null;
}

interface QRCodesModalProps {
  eventName: string;
  qrCodes: QRCode[];
  triggerClassName?: string;
}

export function QRCodesModal({
  eventName,
  qrCodes,
  triggerClassName = "w-full",
}: QRCodesModalProps) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % qrCodes.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + qrCodes.length) % qrCodes.length);
  };

  const currentQR = qrCodes[currentIndex];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName}>Ver mis códigos QR</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{eventName}</DialogTitle>
          <DialogDescription>
            Entrada {currentIndex + 1} de {qrCodes.length}
          </DialogDescription>
        </DialogHeader>

        {qrCodes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No se encontraron códigos QR
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* QR Code Display */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">
                  Entrada #{currentIndex + 1}
                </h3>
                {currentQR?.scan && (
                  <Badge variant="secondary">Escaneado</Badge>
                )}
              </div>

              {/* SVG QR Code - Centered and Full Size */}
              <div className="bg-white p-6 rounded-lg w-full max-w-sm mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentQR?.svg}
                  alt={`QR Code ${currentIndex + 1}`}
                  className="w-full h-auto"
                />
              </div>

              {/* Navigation Controls */}
              {qrCodes.length > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPrev}
                    disabled={qrCodes.length <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Dot indicators */}
                  <div className="flex gap-2">
                    {qrCodes.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 w-2 rounded-full transition-all ${
                          index === currentIndex
                            ? "bg-primary w-4"
                            : "bg-muted-foreground/30"
                        }`}
                        aria-label={`Ir a entrada ${index + 1}`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNext}
                    disabled={qrCodes.length <= 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Wallet buttons */}
              {(currentQR?.apple || currentQR?.google) && (
                <div className="flex gap-2 w-full">
                  {currentQR.apple && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <a
                        href={currentQR.apple}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Smartphone className="h-4 w-4 mr-2" />
                        Apple Wallet
                      </a>
                    </Button>
                  )}
                  {currentQR.google && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <a
                        href={currentQR.google}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Google Wallet
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
