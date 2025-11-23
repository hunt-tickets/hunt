import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import { db } from "@/lib/drizzle";
import { venues } from "@/lib/schema";

//   npx tsx scripts/import-venues.ts

// Type for CSV records
interface VenueCSVRecord {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  logo: string;
  latitude: string;
  longitude: string;
  banner: string;
  link: string;
  static_map_url: string;
  google_name: string;
  google_street_number: string;
  google_neighborhood: string;
  google_route: string;
  google_sublocality: string;
  google_locality: string;
  google_area_level_1: string;
  google_area_level_2: string;
  google_postal_code: string;
  google_country: string;
  google_country_code: string;
  google_id: string;
  google_maps_link: string;
  timezone_id: string;
  timezone_name: string;
  utc_offset: string;
  dts_offset: string;
  google_total_reviews: string;
  google_avg_rating: string;
  google_website_url: string;
  google_phone_number: string;
  currency_code: string;
  wheelchair_accessible: string;
  venue_type: string;
  ai_description: string;
  instagram: string;
}

// Map of city UUIDs to city names (extracted from the data)
const cityMap: Record<string, string> = {
  "709a1819-8d1a-4338-9cd2-09f6f8bfad19": "Bogotá",
  "19ab886e-d630-4bf6-80fb-92fc5e043a37": "Manizales",
  "a4fe1a69-c633-4db8-802f-0c31c542fe63": "Cartagena",
  "df5a2a81-0b41-4c8a-aeea-7c24a72a278c": "Santa Marta",
  "9ba7070e-c946-4ba9-9d0e-2c7368af2daf": "Chía",
  "116a8b4b-2cc4-4e8d-a07d-e70001f55b76": "Cali",
};

async function importVenues() {
  const csvContent = readFileSync(
    "/Users/LuisFernandez/Downloads/venues_rows.csv",
    "utf-8"
  );

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  }) as VenueCSVRecord[];

  console.log(`Importing ${records.length} venues...`);

  for (const record of records) {
    try {
      // Transform the data to match the new schema
      const venueData = {
        id: record.id,
        name: record.name,
        description: record.description || null,
        address: record.address || null,
        city: cityMap[record.city] || record.google_locality || null,
        country: record.google_country || null,
        postalCode: record.google_postal_code || null,
        state: record.google_area_level_1 || null,
        latitude: record.latitude || null,
        longitude: record.longitude || null,
        logo: record.logo || null,
        banner: record.banner || null,
        link: record.link || null,
        staticMapUrl: record.static_map_url || null,
        googleId: record.google_id || null,
        googleName: record.google_name || null,
        googleMapsLink: record.google_maps_link || null,
        googleLocality: record.google_locality || null,
        googleAreaLevel1: record.google_area_level_1 || null,
        googlePostalCode: record.google_postal_code || null,
        googleCountry: record.google_country || null,
        googleCountryCode: record.google_country_code || null,
        googlePhoneNumber: record.google_phone_number || null,
        googleWebsiteUrl: record.google_website_url || null,
        googleAvgRating: record.google_avg_rating || null,
        googleTotalReviews: record.google_total_reviews || null,
        timezoneId: record.timezone_id || null,
        timezoneName: record.timezone_name || null,
        utcOffset: record.utc_offset || null,
        dtsOffset: record.dts_offset || null,
        currencyCode: record.currency_code || null,
        wheelchairAccessible: record.wheelchair_accessible === "true" || null,
        venueType: record.venue_type || null,
        aiDescription: record.ai_description || null,
        instagram: record.instagram || null,
      };

      await db.insert(venues).values(venueData).onConflictDoNothing();
      console.log(`✓ Imported: ${venueData.name}`);
    } catch (error) {
      console.error(`✗ Failed to import ${record.name}:`, error);
    }
  }

  console.log("Import complete!");
}

importVenues().catch(console.error);
