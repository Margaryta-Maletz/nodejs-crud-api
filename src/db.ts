import { v4 as uuid, validate } from 'uuid';

export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

const database = new Map<string, User>();

export const getAllUsers = async (): Promise<User[]> =>
  Array.from(database.values());

export const getUserById = async (id: string): Promise<User | null> =>
  database.get(id) || null;

export const createUser = async (data: Omit<User, 'id'>): Promise<User> => {
  const user: User = { id: uuid(), ...data };
  database.set(user.id, user);
  return user;
};

export const updateUser = async (
  id: string,
  data: Omit<User, 'id'>,
): Promise<User | null> => {
  if (!database.has(id)) return null;
  const updated: User = { id, ...data };
  database.set(id, updated);
  return updated;
};

export const deleteUser = async (id: string): Promise<boolean> =>
  database.delete(id);

export const isValidId = (id: string) => validate(id);
