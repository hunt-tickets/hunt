import { PopularEvents } from "@/components/popular-events";
import { Component } from "@/components/ui/gradient-bar-hero-section";
import { FixedHeroWrapper } from "@/components/fixed-hero-wrapper";

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* Gradient Bar Hero Section with Shader Background - Fixed position with locked height */}
      <FixedHeroWrapper>
        <Component />
      </FixedHeroWrapper>

      {/* Popular Events Section - Parallax effect */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 bg-[#101010] rounded-t-[24px] sm:rounded-t-[32px] md:rounded-t-[48px] -mt-12 sm:-mt-16 md:-mt-20">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-6 sm:mb-8">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-white"
              style={{ fontFamily: "LOT, sans-serif" }}
            >
              Eventos Populares
            </h2>
          </div>

          {/* Popular Events component handles all event display logic */}
          <PopularEvents
            // Optionally pass a cityId to filter events by city
            // cityId="some-city-id"
            limit={6} // Display 6 events in the grid
          />
        </div>
      </section>
    </div>
  );
}
