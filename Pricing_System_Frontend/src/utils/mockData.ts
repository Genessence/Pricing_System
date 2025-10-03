import { User, UserRole } from "../types/auth";

export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Super Administrator",
    role: UserRole.SUPER_ADMIN,
    permissions: [
      "user.create",
      "user.read",
      "user.update",
      "user.delete",
      "admin.access",
      "system.config",
      "backup.create",
      "analytics.view",
      "reports.generate",
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "manager@example.com",
    name: "Administrator",
    role: UserRole.ADMIN,
    permissions: [
      "user.create",
      "user.read",
      "user.update",
      "admin.access",
      "reports.generate",
      "analytics.view",
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    email: "user@example.com",
    name: "Regular User",
    role: UserRole.USER,
    permissions: ["user.read", "reports.view"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export const mockLogin = (
  email: string,
  password: string
): { user: User; token: string } | null => {
  // Simple demo login - in real app, this would be handled by backend
  if (password !== "password123") {
    return null;
  }

  const user = mockUsers.find((u) => u.email === email);
  if (!user) {
    return null;
  }

  // Generate a mock token
  const token = `mock_token_${user.id}_${Date.now()}`;

  return { user, token };
};
