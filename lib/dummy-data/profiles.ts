export const DUMMY_PROFILES = [
  {
    id: "user-1",
    name: "Juan",
    lastName: "Pérez",
    email: "juan.perez@example.com",
    phone: "+57 300 111 2222",
    birthdate: "1990-05-15",
    gender: "M",
    prefix: "CC",
    document_id: "1234567890",
    admin: true,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    name: "María",
    lastName: "González",
    email: "maria.gonzalez@example.com",
    phone: "+57 301 222 3333",
    birthdate: "1995-08-20",
    gender: "F",
    prefix: "CC",
    document_id: "0987654321",
    admin: false,
    created_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "user-3",
    name: "Carlos",
    lastName: "Rodríguez",
    email: "carlos.rodriguez@example.com",
    phone: "+57 302 333 4444",
    birthdate: "1988-12-10",
    gender: "M",
    prefix: "CC",
    document_id: "1122334455",
    admin: false,
    created_at: "2024-03-01T00:00:00Z",
  },
];

// Usuario por defecto que siempre está "autenticado"
export const CURRENT_USER = DUMMY_PROFILES[0];
