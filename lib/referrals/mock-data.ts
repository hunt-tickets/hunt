/**
 * Mock Data Generators for Referrals System
 *
 * This module provides functions to generate realistic mock data for
 * development and testing purposes. These will be replaced with real
 * API calls in production.
 */

import {
  formatDateString,
  getLastDayOfMonth,
  formatPeriod,
  formatShortMonth,
} from "@/lib/referrals/date-utils";
import { calculatePaymentDate } from "@/lib/colombia-holidays";
import { MOCK_DATA_CONFIG, COMMISSION_RATES } from "@/config/referrals";
import type {
  ReferralData,
  PaymentData,
  RebateData,
  ReferredProducer,
  PaymentRecord,
  RebateRecord,
} from "@/lib/referrals/types";

/**
 * Generates mock referral data
 *
 * @returns Complete referral data structure with stats and referred producers
 */
export function generateReferralData(): ReferralData {
  const referredProducers: ReferredProducer[] = [
    {
      id: "1",
      name: "Eventos Élite",
      joinDate: "2024-10-15",
      status: "Activo",
      eventsCreated: 5,
      yourEarnings: 450000,
    },
    {
      id: "2",
      name: "Producciones Premium",
      joinDate: "2024-09-22",
      status: "Activo",
      eventsCreated: 8,
      yourEarnings: 680000,
    },
    {
      id: "3",
      name: "Night Events",
      joinDate: "2024-10-01",
      status: "Activo",
      eventsCreated: 3,
      yourEarnings: 220000,
    },
    {
      id: "4",
      name: "Sound & Lights Co",
      joinDate: "2024-08-10",
      status: "Inactivo",
      eventsCreated: 2,
      yourEarnings: 150000,
    },
    {
      id: "5",
      name: "Urban Festivals",
      joinDate: "2024-11-05",
      status: "Activo",
      eventsCreated: 4,
      yourEarnings: 320000,
    },
  ];

  const totalEarnings = referredProducers.reduce(
    (sum, p) => sum + p.yourEarnings,
    0
  );
  const activeProducers = referredProducers.filter(
    (p) => p.status === "Activo"
  ).length;

  return {
    referralCode: "HUNT2024XYZ",
    baseUrl: "https://hunt-tickets.com/sign-up",
    huntCommissionRate: COMMISSION_RATES.HUNT_BASE_RATE,
    referralCommissionRate: COMMISSION_RATES.REFERRAL_RATE,
    stats: {
      totalReferrals: referredProducers.length,
      activeProducers,
      totalEarnings,
      pendingEarnings: 350000,
    },
    referredProducers,
  };
}

/**
 * Generates mock payment data with Colombian business day logic
 *
 * @returns Complete payment data structure with current/next cycles and history
 */
export function generatePaymentData(): PaymentData {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Current billing cycle
  const currentCutoff = getLastDayOfMonth(currentYear, currentMonth);
  const currentPayment = calculatePaymentDate(currentCutoff);

  // Next billing cycle
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const nextCutoff = getLastDayOfMonth(nextYear, nextMonth);
  const nextPayment = calculatePaymentDate(nextCutoff);

  // Generate payment history
  const paymentHistory: PaymentRecord[] = [];
  for (let i = 1; i <= MOCK_DATA_CONFIG.PAYMENT_HISTORY_MONTHS; i++) {
    const histMonth = currentMonth - i;
    const histYear = histMonth < 0 ? currentYear - 1 : currentYear;
    const adjustedMonth = histMonth < 0 ? 12 + histMonth : histMonth;

    const cutoff = getLastDayOfMonth(histYear, adjustedMonth);
    const payment = calculatePaymentDate(cutoff);

    const amount = Math.floor(
      MOCK_DATA_CONFIG.PAYMENT_AMOUNT_MIN +
        Math.random() *
          (MOCK_DATA_CONFIG.PAYMENT_AMOUNT_MAX -
            MOCK_DATA_CONFIG.PAYMENT_AMOUNT_MIN)
    );

    paymentHistory.push({
      id: String(i),
      cutoffDate: formatDateString(cutoff),
      paymentDate: formatDateString(payment),
      amount,
      status: "Pagado",
      period: formatPeriod(cutoff),
    });
  }

  const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
  const averagePayment = Math.floor(totalPaid / paymentHistory.length);

  return {
    currentBillingCycle: {
      cutoffDate: formatDateString(currentCutoff),
      paymentDate: formatDateString(currentPayment),
      estimatedAmount: MOCK_DATA_CONFIG.CURRENT_CYCLE_ESTIMATED_AMOUNT,
      status: "En Curso",
      period: formatPeriod(currentCutoff),
    },
    nextBillingCycle: {
      cutoffDate: formatDateString(nextCutoff),
      paymentDate: formatDateString(nextPayment),
      period: formatPeriod(nextCutoff),
    },
    paymentHistory,
    stats: {
      totalPaid,
      nextPaymentAmount: MOCK_DATA_CONFIG.CURRENT_CYCLE_ESTIMATED_AMOUNT,
      averagePayment,
    },
  };
}

/**
 * Generates mock rebate data
 *
 * @returns Complete rebate data structure with current period, history, and stats
 */
export function generateRebateData(): RebateData {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Current period
  const currentCutoff = getLastDayOfMonth(currentYear, currentMonth);

  // Generate rebate history
  const rebateHistory: RebateRecord[] = [];
  for (let i = 1; i <= MOCK_DATA_CONFIG.REBATE_HISTORY_MONTHS; i++) {
    const histMonth = currentMonth - i;
    const histYear = histMonth < 0 ? currentYear - 1 : currentYear;
    const adjustedMonth = histMonth < 0 ? 12 + histMonth : histMonth;

    const cutoff = getLastDayOfMonth(histYear, adjustedMonth);

    // Generate 1-3 events per month
    const numEvents =
      Math.floor(Math.random() * MOCK_DATA_CONFIG.REBATE_EVENTS_PER_MONTH_MAX) +
      MOCK_DATA_CONFIG.REBATE_EVENTS_PER_MONTH_MIN;

    for (let e = 0; e < numEvents; e++) {
      const ticketsSold =
        Math.floor(
          Math.random() *
            (MOCK_DATA_CONFIG.REBATE_TICKETS_MAX -
              MOCK_DATA_CONFIG.REBATE_TICKETS_MIN)
        ) + MOCK_DATA_CONFIG.REBATE_TICKETS_MIN;

      const revenuePerTicket =
        Math.floor(
          Math.random() *
            (MOCK_DATA_CONFIG.REBATE_REVENUE_PER_TICKET_MAX -
              MOCK_DATA_CONFIG.REBATE_REVENUE_PER_TICKET_MIN)
        ) + MOCK_DATA_CONFIG.REBATE_REVENUE_PER_TICKET_MIN;

      const totalRevenue = ticketsSold * revenuePerTicket;
      const rebatePercentage = COMMISSION_RATES.REBATE_RATE;
      const rebateAmount = Math.floor(
        totalRevenue * (rebatePercentage / 100)
      );

      rebateHistory.push({
        id: `${i}-${e}`,
        eventName: `Evento ${String.fromCharCode(65 + e)} - ${
          formatShortMonth(cutoff).split(" ")[0]
        }`,
        eventDate: formatDateString(
          new Date(histYear, adjustedMonth, Math.floor(Math.random() * 28) + 1)
        ),
        ticketsSold,
        totalRevenue,
        rebatePercentage,
        rebateAmount,
        status: "Aplicado",
        period: formatPeriod(cutoff),
      });
    }
  }

  // Sort by event date (most recent first)
  rebateHistory.sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  );

  // Calculate stats
  const totalRebate = rebateHistory.reduce((sum, r) => sum + r.rebateAmount, 0);
  const totalRevenue = rebateHistory.reduce(
    (sum, r) => sum + r.totalRevenue,
    0
  );
  const totalTickets = rebateHistory.reduce(
    (sum, r) => sum + r.ticketsSold,
    0
  );
  const averageRebate =
    rebateHistory.length > 0 ? Math.floor(totalRebate / rebateHistory.length) : 0;

  return {
    currentPeriod: {
      cutoffDate: formatDateString(currentCutoff),
      period: formatPeriod(currentCutoff),
      estimatedRebate: 0, // No events in current month for this mock
      activeEvents: 0,
    },
    rebateHistory,
    stats: {
      totalRebate,
      totalRevenue,
      totalTickets,
      averageRebate,
      rebatePercentage: COMMISSION_RATES.REBATE_RATE,
    },
  };
}
