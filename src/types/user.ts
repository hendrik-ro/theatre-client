export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  username: string;
  password: string;
}
