import { useEffect, useRef } from "react";

interface BoldCheckoutData {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  integrityHash: string;
  customerData: {
    email: string;
    fullName: string;
    phone: string;
    dialCode: string;
    documentNumber: string;
    documentType: string;
  };
}

declare global {
  interface Window {
    BoldCheckout: any;
  }
}

/**
 * Hook to handle Bold checkout integration
 * Accepts pre-generated checkout data from server action for security
 */
export const useBoldCheckout = () => {
  const checkoutRef = useRef<any>(null);

  useEffect(() => {
    const loadBoldScript = () => {
      if (
        document.querySelector(
          'script[src="https://checkout.bold.co/library/boldPaymentButton.js"]'
        )
      )
        return;

      const script = document.createElement("script");
      script.src = "https://checkout.bold.co/library/boldPaymentButton.js";
      script.onload = () =>
        window.dispatchEvent(new Event("boldCheckoutLoaded"));
      document.head.appendChild(script);
    };

    loadBoldScript();
  }, []);

  /**
   * Opens Bold checkout with server-generated data
   * @param checkoutData - Pre-generated checkout data from server action
   */
  const openCheckout = async (checkoutData: BoldCheckoutData) => {
    if (!window.BoldCheckout) {
      console.error("BoldCheckout library is not loaded");
      throw new Error("BoldCheckout no está cargado");
    }

    try {
      const config = {
        orderId: checkoutData.orderId,
        currency: checkoutData.currency,
        amount: checkoutData.amount,
        apiKey: process.env.NEXT_PUBLIC_BOLD_API_KEY,
        integritySignature: checkoutData.integrityHash,
        description: checkoutData.description,
        renderMode: "embedded", // Open as embedded iframe instead of redirect
        originUrl: window.location.href, // Required for embedded mode
        redirectionUrl: `${window.location.origin}/payment/confirm`,
        expirationDate: (Date.now() + 10 * 60 * 1000) * 1_000_000, // 10 minutes in nanoseconds
        customerData: JSON.stringify(checkoutData.customerData),
      };

      const checkout = new window.BoldCheckout(config);
      checkoutRef.current = checkout;
      checkout.open();
    } catch (error) {
      console.error("❌ Error al crear instancia BoldCheckout:", error);
      throw error;
    }
  };

  return {
    openCheckout,
  };
};
