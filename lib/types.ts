// Shared type definitions for the application

export interface Producer {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  logo?: string;
  banner?: string;
}

export interface Ticket {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface EventFull {
  id: string;
  age: number | null;
  name: string;
  flyer: string;
  date: string;
  hour: string;
  end_date: string;
  end_hour: string;
  variable_fee: number;
  venue_id: string;
  venue_name: string;
  venue_logo: string;
  venue_latitude: number;
  venue_longitude: number;
  venue_address: string;
  venue_city: string;
  venue_google_maps_link?: string;
  venue_google_website_url?: string;
  venue_google_phone_number?: string;
  venue_google_avg_rating?: string;
  venue_google_total_reviews?: string;
  venue_ai_description?: string;
  producers: Producer[];
  description: string;
  tickets: Ticket[];
}
