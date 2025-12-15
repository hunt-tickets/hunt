/**
 * Mock data generators for Users System
 *
 * Provides realistic mock data for development and testing.
 * Following the same pattern as the referrals system.
 */

import type {
  User,
  UserTransaction,
  UserWithTransactions,
  UserStats,
  UserGrowthDataPoint,
} from "@/lib/users/types";

// ============================================================================
// MOCK USERS
// ============================================================================

export const MOCK_USERS: User[] = [
  {
    id: "user-1",
    name: "María",
    lastName: "García",
    email: "maria@example.com",
    phone: "3001234567",
    birthdate: "1995-06-15",
    gender: "Femenino",
    prefix: "+57",
    document_id: "1234567890",
    created_at: "2025-01-15T10:30:00Z",
    marketing_emails: true,
    admin: false,
  },
  {
    id: "user-2",
    name: "Carlos",
    lastName: "Rodríguez",
    email: "carlos@example.com",
    phone: "3109876543",
    birthdate: "1988-03-22",
    gender: "Masculino",
    prefix: "+57",
    document_id: "0987654321",
    created_at: "2024-11-20T14:15:00Z",
    marketing_emails: false,
    admin: true,
  },
  {
    id: "user-3",
    name: "Ana",
    lastName: "Martínez",
    email: "ana@example.com",
    phone: "3201122334",
    birthdate: "2000-09-10",
    gender: "Femenino",
    prefix: "+57",
    document_id: "1122334455",
    created_at: "2024-12-05T09:00:00Z",
    marketing_emails: true,
    admin: false,
  },
];

// ============================================================================
// MOCK TRANSACTIONS
// ============================================================================

export const MOCK_TRANSACTIONS: UserTransaction[] = [
  {
    id: "txn-1",
    event_name: "Concierto Rock 2025",
    ticket_name: "VIP",
    quantity: 2,
    total: 150000,
    source: "web",
    created_at: "2025-01-10T18:00:00Z",
  },
  {
    id: "txn-2",
    event_name: "Festival Electrónico",
    ticket_name: "General",
    quantity: 1,
    total: 80000,
    source: "app",
    created_at: "2024-12-15T20:30:00Z",
  },
  {
    id: "txn-3",
    event_name: "Teatro Musical",
    ticket_name: "Palco",
    quantity: 4,
    total: 320000,
    source: "cash",
    created_at: "2024-11-25T15:45:00Z",
  },
];

// ============================================================================
// GENERATOR FUNCTIONS
// ============================================================================

/**
 * Generates a complete user with transactions
 *
 * @param userId - User ID
 * @returns User with transactions and calculated totals
 *
 * @example
 * ```typescript
 * const user = generateUserWithTransactions("user-1");
 * console.log(user.totalSpent); // 230000
 * console.log(user.totalTickets); // 3
 * ```
 */
export function generateUserWithTransactions(
  userId: string
): UserWithTransactions {
  const user = MOCK_USERS.find((u) => u.id === userId) || MOCK_USERS[0];

  // Filter transactions for this user (in real implementation, would be by user_id)
  // For mock data, we'll just assign some transactions
  const userTransactions = MOCK_TRANSACTIONS.slice(0, 2);

  const totalSpent = userTransactions.reduce((sum, txn) => sum + txn.total, 0);
  const totalTickets = userTransactions.reduce(
    (sum, txn) => sum + txn.quantity,
    0
  );

  return {
    ...user,
    transactions: userTransactions,
    totalSpent,
    totalTickets,
  };
}

/**
 * Generates user statistics
 *
 * @returns User statistics object
 *
 * @example
 * ```typescript
 * const stats = generateUserStats();
 * console.log(stats.totalUsers); // 3
 * console.log(stats.usersWithPurchases); // 2
 * ```
 */
export function generateUserStats(): UserStats {
  const totalUsers = MOCK_USERS.length;
  const activeUsers = MOCK_USERS.filter((u) => u.marketing_emails).length;

  // Calculate new users this month
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newUsersThisMonth = MOCK_USERS.filter(
    (u) => new Date(u.created_at) >= firstOfMonth
  ).length;

  const totalRevenue = MOCK_TRANSACTIONS.reduce(
    (sum, txn) => sum + txn.total,
    0
  );
  const totalTickets = MOCK_TRANSACTIONS.reduce(
    (sum, txn) => sum + txn.quantity,
    0
  );
  const averageTicketsPerUser = totalUsers > 0 ? totalTickets / totalUsers : 0;

  return {
    totalUsers,
    activeUsers,
    newUsersThisMonth,
    usersWithPurchases: 2, // Mock: users with transactions
    totalRevenue,
    averageTicketsPerUser,
  };
}

/**
 * Generates user growth data for charts
 *
 * @param months - Number of months to generate (default: 6)
 * @returns Array of growth data points
 *
 * @example
 * ```typescript
 * const growthData = generateUserGrowthData(12);
 * console.log(growthData[0]); // { month: "ene 24", users: 45, revenue: 1250000 }
 * ```
 */
export function generateUserGrowthData(
  months = 6
): UserGrowthDataPoint[] {
  const data: UserGrowthDataPoint[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString("es-CO", {
      month: "short",
      year: "2-digit",
    });

    // Generate realistic growth pattern
    const baseUsers = 50;
    const growth = (months - i) * 15;
    const randomVariation = Math.floor(Math.random() * 20) - 10;
    const users = baseUsers + growth + randomVariation;

    // Revenue grows with users
    const avgRevenuePerUser = 85000;
    const revenue = users * avgRevenuePerUser + Math.floor(Math.random() * 500000);

    data.push({
      month: monthName,
      users,
      revenue,
    });
  }

  return data;
}

/**
 * Generates additional mock users for testing pagination
 *
 * @param count - Number of users to generate
 * @returns Array of generated users
 *
 * @example
 * ```typescript
 * const users = generateMockUsers(100);
 * console.log(users.length); // 100
 * ```
 */
export function generateMockUsers(count: number): User[] {
  const firstNames = [
    "María",
    "Carlos",
    "Ana",
    "Juan",
    "Laura",
    "Diego",
    "Sofia",
    "Miguel",
    "Valentina",
    "Andrés",
  ];
  const lastNames = [
    "García",
    "Rodríguez",
    "Martínez",
    "López",
    "González",
    "Pérez",
    "Sánchez",
    "Ramírez",
    "Torres",
    "Flores",
  ];
  const genders = ["Masculino", "Femenino", "Otro", "Prefiero no decir"];

  const users: User[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const gender = genders[Math.floor(Math.random() * genders.length)];

    // Generate random date in the past 2 years
    const daysAgo = Math.floor(Math.random() * 730);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    // Generate random birthdate (18-65 years old)
    const age = 18 + Math.floor(Math.random() * 47);
    const birthdate = new Date();
    birthdate.setFullYear(birthdate.getFullYear() - age);

    users.push({
      id: `user-${i + 4}`,
      name: firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      phone: `30${Math.floor(Math.random() * 100000000)}`,
      birthdate: birthdate.toISOString().split("T")[0],
      gender,
      prefix: "+57",
      document_id: `${Math.floor(Math.random() * 10000000000)}`,
      created_at: createdAt.toISOString(),
      marketing_emails: Math.random() > 0.3,
      admin: Math.random() > 0.9,
    });
  }

  return users;
}
