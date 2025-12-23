import { ProductorHero } from "@/components/productor-hero";
import { ShaderAnimation } from "@/components/ui/shader-animation";

export default function ProductorPage() {
  return (
    <div className="relative min-h-screen bg-black">
      {/* Fixed shader background */}
      <div className="fixed inset-0 z-0">
        <ShaderAnimation />
      </div>

      {/* Content */}
      <ProductorHero />
    </div>
  );
}
