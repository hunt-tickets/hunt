export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-[#040404] text-white relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#040404] via-[#0a0a0a] to-[#1a1a1a]" />

      {/* Optional overlay pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]" />
      <div className="relative h-screen flex items-center justify-center px-4 pt-20 pb-4">
        <div className="w-full max-w-lg h-full max-h-screen overflow-hidden flex flex-col justify-center">
          {children}
        </div>
      </div>
    </main>
  );
}
