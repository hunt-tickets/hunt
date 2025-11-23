export interface PaymentData {
  id: string;
  order: string;
  user_id: string;
  ticket_id: string;
  price: number;
  variable_fee: number;
  tax: number;
  quantity: number;
  total: number;
  status: string;
}

export interface Profile {
  id: string;
  updated_at: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  birthdate: string;
  gender: string;
  document_id: string;
  document_type_id: string;
  alegra_id: string;
  new: boolean;
  tyc: boolean;
  admin: boolean;
  created_at: string;
}

export interface City {
  id: string;
  name: string;
}

export interface TabContentItem {
  id: string;
  type: "create" | "event";
  icon?: string;
  text?: string;
  location?: string;
  name?: string;
  image?: string;
}

export interface Tab {
  id: string;
  value: string;
  label: string;
  content: TabContentItem[];
}

export interface InfoItem {
  // icon: SubframeCore.IconName;
  label: string;
  value: string;
}

export interface Producer {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  logo?: string;
  banner?: string;
}

export interface ProducerView {
  producer_id: string;
  producers: {
    name: string;
    logo: string;
  };
}

export interface ProducerCategory {
  id: string;
  name: string;
  status: boolean;
  icon: string | null;
}

export interface Resident {
  artist_id: string;
  name: string;
  category: string;
  logo: string;
}

export interface Venue {
  venue_id: string;
  name: string;
  city: string;
  logo: string;
}

export interface Technician {
  technician_id: string;
  name: string;
  image: string;
}

export interface Event {
  id: string;
  name: string;
  flyer: string;
  venue_name: string;
  date: string;
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

export interface Ticket {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface SocialLink {
  link: string;
}

export interface Social {
  id: string;
  social_media_id: string;
  producer_id: string;
  link: SocialLink;
  name: string;
  icon: string;
}

export interface SocialMedia {
  id: string;
  social_media_id: string;
  link: SocialLink;
  name: string;
  icon: string;
}

export interface SocialCreate {
  social_media_id: string;
  producer_id: string;
  link: string;
}

export interface ProducerAddCategory {
  producer_id: string;
  producer_category_id: string;
}

export interface ProducerCategoryOrder {
  id: string;
  producer_id: string;
  position: number;
  status: boolean;
  producers_category: {
    icon: string;
    name: string;
  };
}

export interface ProducerTaxData {
  id?: string;
  producer_id: string;
  document_type_id: string;
  document_id: string;
  div: string | null;
  legal_name: string;
  rut: string;
}

export interface ProducerRut {
  Key: string;
  Bucket: string;
}

export interface KeyBucket {
  Key: string;
  Bucket: string;
}

export interface Logo {
  logo: string;
}

export interface Banner {
  banner: string;
}

export interface Seller {
  id: string;
  producer_id: string;
  user_id: string;
  full_name: string;
}

export interface SellerUser {
  id: string;
  producer_id: string;
  user_id: string;
}

export interface DocumentType {
  id: string;
  name: string;
}

export interface EventVariabelFee {
  variable_fee: number;
}

/**
 * Type definitions for Event Financial Report
 * Generated from get_event_sales_summary_with_validation RPC function
 */

export interface EventFinancialReport {
  event_id: string;
  timestamp: string;
  app_total: number;
  web_total: number;
  cash_total: number;
  total_price: number;
  total_tax: number;
  total_taxes: number;
  total_general: number;
  channels_total: number;
  fixed_fee_total: number;
  settlement_amount: number;
  settlement_amount_inverted: number;
  producer_sales_total_negative: number;
  net_producer_revenue: number;
  events_accounting_total: number;
  total_variable_fee: number;

  hunt_sales: {
    price: number;
    tax: number;
    variable_fee: number;
    total: number;
  };

  producer_sales: {
    price: number;
    tax: number;
    variable_fee: number;
    total: number;
  };

  tickets_sold: {
    app: number;
    web: number;
    cash: number;
    total: number;
  };

  global_calculations: {
    total_global: number;
    liquidacion_total: number;
    ganancia_bruta_hunt: number;
    deducciones_bold_total: number;
    impuesto_4x1000: number;
    ganancia_neta_hunt: number;
  };

  bold_transactions: BoldTransaction[];

  pie_chart_data: ChartDataPoint[];

  channels_data: ChartDataPoint[];

  datafono_calculations: {
    pos_fee: number;
    total_amount: number;
    hunt_commission: number;
    hunt_net_benefit: number;
    tax_on_commission: number;
    producer_net_amount: number;
  };

  validation: {
    revenue_discrepancy: number;
    mismatched_transactions: number;
  };
}

export interface BoldTransaction {
  reference: string;
  fecha: string;
  fixed_fee: number;
  percentage_fee: number;
  total_deduction: number;
  success_stats: {
    successful_transactions: number;
    failed_transactions: number;
    success_rate: number;
    success_rate_formatted: string;
  };
  financial_data: {
    purchase_value: number;
    total_amount: number;
    income_withholding: number;
    vat_withholding: number;
    ica_withholding: number;
    bold_deposit: number;
  };
}

export interface ChartDataPoint {
  category: string;
  percentage: number;
  color: string;
}
