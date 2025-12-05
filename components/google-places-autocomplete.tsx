"use client";

import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface PlaceResult {
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (place: PlaceResult) => void;
  defaultValue?: string;
  apiKey?: string;
}

export function GooglePlacesAutocomplete({
  onPlaceSelect,
  defaultValue = "",
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(defaultValue);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!apiKey) {
      console.warn("Google Maps API key not found");
      return;
    }

    // Load Google Maps script
    const loadGoogleMapsScript = () => {
      if (window.google?.maps?.places) {
        initAutocomplete();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;

      (window as typeof window & { initMap: () => void }).initMap = () => {
        initAutocomplete();
      };

      document.head.appendChild(script);
    };

    const initAutocomplete = () => {
      if (!inputRef.current) return;

      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["establishment", "geocode"],
        fields: ["address_components", "formatted_address", "geometry", "name"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.address_components) {
          return;
        }

        let address = "";
        let city = "";
        let country = "";
        let latitude: number | undefined;
        let longitude: number | undefined;

        // Extract address components
        for (const component of place.address_components) {
          const types = component.types;

          if (types.includes("street_number")) {
            address = component.long_name + " " + address;
          }
          if (types.includes("route")) {
            address += component.long_name;
          }
          if (types.includes("locality")) {
            city = component.long_name;
          }
          if (types.includes("administrative_area_level_1") && !city) {
            city = component.long_name;
          }
          if (types.includes("country")) {
            country = component.long_name;
          }
        }

        // Use formatted_address if we didn't get a good address
        if (!address && place.formatted_address) {
          address = place.formatted_address;
        }

        // Get coordinates
        if (place.geometry?.location) {
          latitude = place.geometry.location.lat();
          longitude = place.geometry.location.lng();
        }

        // Update input value
        setInputValue(place.formatted_address || address);

        // Call callback with extracted data
        onPlaceSelect({
          address: address || place.formatted_address || "",
          city,
          country,
          latitude,
          longitude,
        });
      });

      autocompleteRef.current = autocomplete;
    };

    loadGoogleMapsScript();

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [apiKey, onPlaceSelect]);

  // Update input value when defaultValue changes
  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);

  if (!apiKey) {
    return (
      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2 text-gray-600 dark:text-white/60">
          <MapPin className="h-4 w-4 text-gray-500 dark:text-white/40" />
          Dirección
        </Label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onPlaceSelect({
              address: e.target.value,
              city: "",
              country: "",
            });
          }}
          placeholder="ej. Av. Principal 123, Auditorio Nacional"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#202020] text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20"
        />
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Google Places API no configurada. Usando input manual.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2 text-gray-600 dark:text-white/60">
        <MapPin className="h-4 w-4 text-gray-500 dark:text-white/40" />
        Dirección
      </Label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Busca una dirección..."
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#202020] text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20"
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-white/40">
        Escribe para buscar una dirección y los campos se completarán automáticamente
      </p>
    </div>
  );
}
