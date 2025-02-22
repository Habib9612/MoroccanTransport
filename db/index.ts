import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@db/schema";

const dbConfig = process.env.DATABASE_URL ? {
  connection: process.env.DATABASE_URL,
  schema,
  ws: ws,
} : null;

// Mock user data for development
const mockUsers = [
  {
    id: "1",
    username: "test@example.com", // Can be used as email
    password: "password123",
    name: "Test User",
    role: "SHIPPER"
  }
];

// Mock database implementation
export const db = dbConfig ? drizzle(dbConfig) : {
  users: {
    findFirst: async ({ where }: any) => {
      return mockUsers.find(user => 
        user.username === where?.email || user.username === where?.username
      );
    },
    create: async ({ data }: any) => {
      const newUser = {
        id: String(mockUsers.length + 1),
        ...data
      };
      mockUsers.push(newUser);
      return newUser;
    }
  }
};

// Export mock functions for auth
export const auth = {
  createUser: async (data: any) => {
    return db.users.create({ data });
  },
  signIn: async (email: string, password: string) => {
    const user = await db.users.findFirst({ 
      where: { email } // This will match against username
    });
    if (user && user.password === password) {
      return { user };
    }
    throw new Error('Invalid credentials');
  }
};
