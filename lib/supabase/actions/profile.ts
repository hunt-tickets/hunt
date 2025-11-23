"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface UpdateProfileState {
  success?: boolean;
  error?: string;
}

export interface UserProfile {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  birthdate: string | null;
  gender: string | null;
  prefix: string | null;
  document_id: string | null;
  admin: boolean;
  created_at: string;
}

export async function getAllUsers(): Promise<{
  users: UserProfile[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  // Verify user is authenticated and is admin
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { users: null, error: "Authentication required" };
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.admin) {
    return { users: null, error: "Unauthorized access" };
  }

  // Get all users with pagination to handle large datasets
  const allUsers: UserProfile[] = [];
  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data: users, error } = await supabase
      .from("profiles")
      .select('id, name, "lastName", email, phone, birthdate, gender, prefix, document_id, admin, created_at')
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error(`Error fetching users page ${page}:`, error.message || JSON.stringify(error));
      return { users: null, error: "Failed to fetch users" };
    }

    if (users && users.length > 0) {
      allUsers.push(...(users as UserProfile[]));
      hasMore = users.length === pageSize;
      page++;
    } else {
      hasMore = false;
    }
  }

  console.log(`📊 Total users fetched: ${allUsers.length}`);

  return { users: allUsers, error: null };
}

export async function updateProfile(
  prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Authentication required" };
  }

  // Extract form data
  const name = formData.get("name") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;
  const birthdate = formData.get("birthdate") as string;
  const gender = formData.get("gender") as string;
  const prefix = formData.get("prefix") as string;
  const document_id = formData.get("document_id") as string;

  // Validate input
  if (name && name.trim().length < 3) {
    return { error: "Name must be at least 3 characters" };
  }

  // Update profile
  const { error } = await supabase
    .from("profiles")
    .update({
      name: name || null,
      lastName: lastName || null,
      phone: phone || null,
      birthdate: birthdate || null,
      gender: gender === "no_decir" ? null : gender || null,
      prefix: prefix === "none" ? null : prefix || null,
      document_id: document_id || null,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Profile update error:", error);

    // Handle specific errors
    if (error.code === "23505") {
      // Unique constraint violation
      if (error.message.includes("phone")) {
        return { error: "This phone number is already in use" };
      }
      if (error.message.includes("email")) {
        return { error: "This email is already in use" };
      }
    }

    return { error: "Failed to update profile. Please try again." };
  }

  // Revalidate profile page
  revalidatePath("/profile");

  return { success: true };
}

export interface UpdateUserData {
  name?: string;
  lastName?: string;
  email: string;
  phone?: string;
  birthdate?: string;
  gender?: string;
  prefix?: string;
  document_id?: string;
  admin: boolean;
}

export async function updateUserAsAdmin(
  userId: string,
  userData: UpdateUserData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Verify user is authenticated and is admin
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required" };
  }

  // Check if current user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.admin) {
    return { success: false, error: "Unauthorized access" };
  }

  // Update the target user's profile
  const { error } = await supabase
    .from("profiles")
    .update({
      name: userData.name || null,
      lastName: userData.lastName || null,
      email: userData.email,
      phone: userData.phone || null,
      birthdate: userData.birthdate || null,
      gender: userData.gender || null,
      prefix: userData.prefix || null,
      document_id: userData.document_id || null,
      admin: userData.admin,
    })
    .eq("id", userId);

  if (error) {
    console.error("User update error:", error);

    // Handle specific errors
    if (error.code === "23505") {
      // Unique constraint violation
      if (error.message.includes("phone")) {
        return { success: false, error: "Este número de teléfono ya está en uso" };
      }
      if (error.message.includes("email")) {
        return { success: false, error: "Este email ya está en uso" };
      }
    }

    return { success: false, error: "Error al actualizar el usuario" };
  }

  // Revalidate usuarios page
  revalidatePath("/administrador/usuarios");

  return { success: true };
}

export interface UserTransaction {
  id: string;
  created_at: string;
  ticket_name: string;
  event_name: string;
  quantity: number;
  total: number;
  status: string;
  source: string;
}

export interface UserWithPurchases {
  id: string;
  birthdate: string | null;
  totalTickets: number;
  totalSpent: number;
}

export interface AgeGroupData {
  ageGroup: string;
  users: number;
  tickets: number;
}

export interface GenderData {
  gender: string;
  users: number;
  tickets: number;
}

interface TransactionRecord {
  user_id: string;
  quantity: number;
  total: number;
  status: string;
}

interface UserRecord {
  id: string;
  birthdate: string | null;
  gender: string | null;
}

export async function getUsersWithPurchasesStats(): Promise<{
  ageGroups: AgeGroupData[] | null;
  topBuyers: UserWithPurchases[] | null;
  genderGroups: GenderData[] | null;
  totalUsers: number;
  totalTicketsSold: number;
  error: string | null;
}> {
  const supabase = await createClient();

  // Verify user is authenticated and is admin
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ageGroups: null, topBuyers: null, genderGroups: null, totalUsers: 0, totalTicketsSold: 0, error: "Authentication required" };
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.admin) {
    return { ageGroups: null, topBuyers: null, genderGroups: null, totalUsers: 0, totalTicketsSold: 0, error: "Unauthorized access" };
  }

  // Helper function to get user purchases from a table
  async function getUserPurchasesFromTable(tableName: string) {
    // First, let's check what statuses exist
    const { data: statusCheck, error: statusError } = await supabase
      .from(tableName)
      .select("status")
      .limit(10);

    if (statusError) {
      console.error(`Error checking statuses in ${tableName}:`, statusError.message);
    } else {
      const uniqueStatuses = [...new Set(statusCheck?.map(s => s.status) || [])];
      console.log(`Sample statuses in ${tableName}:`, uniqueStatuses);
    }

    // Get all purchases - process in chunks if needed
    const allData: TransactionRecord[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from(tableName)
        .select("user_id, quantity, total, status")
        .not('status', 'is', null)
        .range(from, from + pageSize - 1);

      if (error) {
        console.error(`Error fetching page from ${tableName}:`, error.message || error);
        hasMore = false;
        break;
      }

      if (data && data.length > 0) {
        allData.push(...data);
        from += pageSize;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    const data = allData;

    // Filter for valid purchases
    const validPurchases = (data || []).filter(p =>
      p.status &&
      (p.status.includes('PAID') ||
       p.status.toLowerCase().includes('paid') ||
       p.status === 'completed' ||
       p.status === 'success')
    );

    console.log(`Fetched ${data?.length || 0} total records, ${validPurchases.length} valid purchases from ${tableName}`);
    return validPurchases;
  }

  // Get purchases from all sources
  const [appPurchases, webPurchases, cashPurchases] = await Promise.all([
    getUserPurchasesFromTable("transactions"),
    getUserPurchasesFromTable("transactions_web"),
    getUserPurchasesFromTable("transactions_cash"),
  ]);

  // Combine all purchases
  const allPurchases = [...appPurchases, ...webPurchases, ...cashPurchases];
  console.log(`Total purchases found: ${allPurchases.length}`);

  // Group by user_id
  const userPurchases = new Map<string, { totalTickets: number; totalSpent: number }>();

  allPurchases.forEach((purchase) => {
    if (!purchase.user_id) {
      console.log('Skipping purchase without user_id:', purchase);
      return;
    }
    const existing = userPurchases.get(purchase.user_id) || { totalTickets: 0, totalSpent: 0 };
    userPurchases.set(purchase.user_id, {
      totalTickets: existing.totalTickets + (purchase.quantity || 0),
      totalSpent: existing.totalSpent + (purchase.total || 0),
    });
  });

  // Get user birthdates for those who have purchased
  const userIds = Array.from(userPurchases.keys());
  console.log(`Unique users with purchases: ${userIds.length}`);

  if (userIds.length === 0) {
    return {
      ageGroups: [],
      topBuyers: [],
      genderGroups: [],
      totalUsers: 0,
      totalTicketsSold: 0,
      error: null,
    };
  }

  // Process userIds in chunks to avoid "Request Header Fields Too Large" error
  const chunkSize = 30; // Small chunk size to avoid header size error
  const userChunks: string[][] = [];

  // Process ALL users, not just a subset
  console.log(`Processing all ${userIds.length} users with purchases`);

  for (let i = 0; i < userIds.length; i += chunkSize) {
    userChunks.push(userIds.slice(i, i + chunkSize));
  }

  console.log(`Processing ${userChunks.length} chunks of ${chunkSize} users each`);

  // Fetch users in batches
  const allUsers: UserRecord[] = [];

  for (const chunk of userChunks) {
    const { data: usersChunk, error: usersError } = await supabase
      .from("profiles")
      .select("id, birthdate, gender")
      .in("id", chunk);

    if (usersError) {
      console.error("Error fetching users chunk:", usersError.message || usersError);
      // Continue with next chunk instead of failing completely
      continue;
    }

    if (usersChunk && usersChunk.length > 0) {
      allUsers.push(...usersChunk);
    }
  }

  const users = allUsers;
  console.log(`Fetched ${users.length} users with purchase data`);

  if (!users || users.length === 0) {
    console.log("No users found with the provided IDs");
    return {
      ageGroups: [],
      topBuyers: [],
      genderGroups: [],
      totalUsers: 0,
      totalTicketsSold: 0,
      error: null,
    };
  }

  // Calculate age groups and gender groups
  const ageGroups = new Map<string, { users: number; tickets: number }>();
  const genderGroups = new Map<string, { users: number; tickets: number }>();
  const usersWithPurchases: UserWithPurchases[] = [];
  let totalTicketsSold = 0;

  users.forEach((user) => {
    const purchases = userPurchases.get(user.id);
    if (!purchases) {
      console.log(`No purchase data found for user ${user.id}`);
      return;
    }

    totalTicketsSold += purchases.totalTickets;

    usersWithPurchases.push({
      id: user.id,
      birthdate: user.birthdate,
      totalTickets: purchases.totalTickets,
      totalSpent: purchases.totalSpent,
    });

    // Calculate age group
    if (user.birthdate) {
      const today = new Date();
      const birth = new Date(user.birthdate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      // Determine age group
      let ageGroup = "Sin edad";
      if (age < 18) {
        ageGroup = "Menores de 18";
      } else if (age >= 18 && age <= 24) {
        ageGroup = "18-24";
      } else if (age >= 25 && age <= 34) {
        ageGroup = "25-34";
      } else if (age >= 35 && age <= 44) {
        ageGroup = "35-44";
      } else if (age >= 45 && age <= 54) {
        ageGroup = "45-54";
      } else {
        ageGroup = "55+";
      }

      const existing = ageGroups.get(ageGroup) || { users: 0, tickets: 0 };
      ageGroups.set(ageGroup, {
        users: existing.users + 1,
        tickets: existing.tickets + purchases.totalTickets,
      });
    } else {
      const existing = ageGroups.get("Sin edad") || { users: 0, tickets: 0 };
      ageGroups.set("Sin edad", {
        users: existing.users + 1,
        tickets: existing.tickets + purchases.totalTickets,
      });
    }

    // Calculate gender group (ignore null values)
    if (user.gender && user.gender.trim() !== '') {
      const genderLabel = user.gender === 'masculino' ? 'Masculino' : user.gender === 'femenino' ? 'Femenino' : 'Otro';
      const existing = genderGroups.get(genderLabel) || { users: 0, tickets: 0 };
      genderGroups.set(genderLabel, {
        users: existing.users + 1,
        tickets: existing.tickets + purchases.totalTickets,
      });
    }
  });

  // Convert to arrays
  const ageGroupsArray: AgeGroupData[] = Array.from(ageGroups.entries()).map(([ageGroup, data]) => ({
    ageGroup,
    users: data.users,
    tickets: data.tickets,
  }));

  // Sort age groups in logical order
  const ageOrder = ["Menores de 18", "18-24", "25-34", "35-44", "45-54", "55+", "Sin edad"];
  ageGroupsArray.sort((a, b) => {
    return ageOrder.indexOf(a.ageGroup) - ageOrder.indexOf(b.ageGroup);
  });

  // Get top 10 buyers
  const topBuyers = usersWithPurchases
    .sort((a, b) => b.totalTickets - a.totalTickets)
    .slice(0, 10);

  // Convert gender groups to array
  const genderGroupsArray: GenderData[] = Array.from(genderGroups.entries()).map(([gender, data]) => ({
    gender,
    users: data.users,
    tickets: data.tickets,
  }));

  // Sort gender groups (Masculino, Femenino, Otro)
  const genderOrder = ["Masculino", "Femenino", "Otro"];
  genderGroupsArray.sort((a, b) => {
    return genderOrder.indexOf(a.gender) - genderOrder.indexOf(b.gender);
  });

  console.log(`Final stats: ${users.length} users fetched, ${userIds.length} total users with purchases`);
  console.log(`Gender distribution calculated: ${genderGroupsArray.length} different genders`);

  return {
    ageGroups: ageGroupsArray,
    topBuyers,
    genderGroups: genderGroupsArray,
    totalUsers: userIds.length, // Use total count of users with purchases
    totalTicketsSold,
    error: null,
  };
}

export async function getUserTransactions(userId: string): Promise<{
  transactions: UserTransaction[] | null;
  totalSpent: number;
  totalTickets: number;
  error: string | null;
}> {
  const supabase = await createClient();

  // Verify user is authenticated and is admin
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { transactions: null, totalSpent: 0, totalTickets: 0, error: "Authentication required" };
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.admin) {
    return { transactions: null, totalSpent: 0, totalTickets: 0, error: "Unauthorized access" };
  }

  // Helper function to fetch transactions from a table
  async function fetchUserTransactions(tableName: string, source: string) {
    const { data, error } = await supabase
      .from(tableName)
      .select(`
        id,
        created_at,
        quantity,
        total,
        status,
        ticket_id,
        tickets!inner(
          name,
          event_id,
          events!inner(name)
        )
      `)
      .eq("user_id", userId)
      .not('status', 'is', null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching from ${tableName}:`, error);
      return [];
    }

    // Filter for valid purchases
    const validTransactions = (data || []).filter(tx =>
      tx.status &&
      (tx.status.includes('PAID') ||
       tx.status.toLowerCase().includes('paid') ||
       tx.status === 'completed' ||
       tx.status === 'success')
    );

    return validTransactions.map((tx: Record<string, unknown>) => {
      const tickets = tx.tickets as { name: string; events: { name: string } };
      return {
        id: tx.id as string,
        created_at: tx.created_at as string,
        ticket_name: tickets.name,
        event_name: tickets.events.name,
        quantity: tx.quantity as number,
        total: tx.total as number,
        status: tx.status as string,
        source: source,
      };
    });
  }

  // Get transactions from all sources
  const [appTxs, webTxs, cashTxs] = await Promise.all([
    fetchUserTransactions("transactions", "app"),
    fetchUserTransactions("transactions_web", "web"),
    fetchUserTransactions("transactions_cash", "cash"),
  ]);

  const allTransactions = [...appTxs, ...webTxs, ...cashTxs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Calculate totals
  const totalSpent = allTransactions.reduce((sum, tx) => sum + tx.total, 0);
  const totalTickets = allTransactions.reduce((sum, tx) => sum + tx.quantity, 0);

  return {
    transactions: allTransactions,
    totalSpent,
    totalTickets,
    error: null,
  };
}
