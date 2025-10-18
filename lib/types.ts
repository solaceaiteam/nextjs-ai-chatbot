export type DataPart = { type: 'append-message'; message: string };

export type UserType = 'guest' | 'regular';

export interface User {
  id: string;
  email: string;
  type: UserType;
  name?: string;
  image?: string;
}
