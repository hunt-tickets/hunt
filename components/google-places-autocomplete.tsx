/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// TODO: Fix Google Maps types - this file is currently not in use
"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";

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
  label?: string;
  required?: boolean;
}

export function GooglePlacesAutocomplete({
  onPlaceSelect,
  defaultValue = "",
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  label,
  required,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    if (!apiKey) {
      console.warn("Google Maps API key not found");
      setIsLoading(false);
      return;
    }

    // Load Google Maps script
    const loadGoogleMapsScript = () => {
      if (window.google?.maps?.places) {
        initAutocomplete();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Script is already loading, wait for it
        (window as typeof window & { initMap: () => void }).initMap = () => {
          initAutocomplete();
        };
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

      // Style the Google autocomplete dropdown (only add once)
      if (!document.getElementById('google-places-custom-styles')) {
        const style = document.createElement('style');
        style.id = 'google-places-custom-styles';
        style.textContent = `
          .pac-container {
            background-color: white;
            border-radius: 0.75rem;
            border: 1px solid #e5e7eb;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            margin-top: 0.5rem;
            font-family: inherit;
            z-index: 9999;
          }

          .dark .pac-container {
            background-color: #1a1a1a;
            border-color: #2a2a2a;
          }

          .pac-item {
            padding: 0.75rem 1rem;
            cursor: pointer;
            border-top: 1px solid #f3f4f6;
            font-size: 0.875rem;
          }

          .dark .pac-item {
            border-top-color: #2a2a2a;
            color: #fff;
          }

          .pac-item:hover {
            background-color: #f9fafb;
          }

          .dark .pac-item:hover {
            background-color: #202020;
          }

          .pac-item-selected {
            background-color: #f3f4f6;
          }

          .dark .pac-item-selected {
            background-color: #252525;
          }

          .pac-icon {
            display: none;
          }

          .pac-item-query {
            color: #111827;
            font-weight: 500;
          }

          .dark .pac-item-query {
            color: #fff;
          }

          .pac-matched {
            font-weight: 600;
          }

          .pac-logo:after {
            background-image: url(https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png) !important;
            background-size: contain;
          }

          .dark .pac-logo:after {
            background-image: url(https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png) !important;
            filter: brightness(0) invert(1);
          }
        `;
        document.head.appendChild(style);
      }

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
      setIsLoading(false);
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
        {label && (
          <label className="text-sm font-medium text-gray-600 dark:text-white/60 select-none">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
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
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-gray-50/50 dark:bg-[#202020]/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:border-gray-900 dark:focus:border-white/50 focus:ring-gray-900/10 dark:focus:ring-white/10 transition-all duration-200"
        />
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Google Places API no configurada. Usando input manual.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-600 dark:text-white/60 select-none">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-gray-500 dark:text-white/40 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-gray-500 dark:text-white/40" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Busca una dirección..."
          disabled={isLoading}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-gray-50/50 dark:bg-[#202020]/50 backdrop-blur-sm text-sm placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:border-gray-900 dark:focus:border-white/50 focus:ring-gray-900/10 dark:focus:ring-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300 dark:hover:border-[#333333]"
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-white/40">
        {isLoading
          ? "Cargando buscador de direcciones..."
          : "Escribe para buscar una dirección y los campos se completarán automáticamente"
        }
      </p>
    </div>
  );
}
