import { SessionDrizzleRepository } from "./session.drizzle";
import { UserDrizzleRepository } from "./user.drizzle";

export const userDrizzleRepository = new UserDrizzleRepository();
export const sessionDrizzleRepository = new SessionDrizzleRepository();

export * from "./user.drizzle";
export * from "./session.drizzle";
