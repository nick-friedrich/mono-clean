import { UserMockRepository } from "./user.mock";
import { SessionMockRepository } from "./session.mock";

export const userMockRepository = new UserMockRepository();
export const sessionMockRepository = new SessionMockRepository();

export * from "./user.mock";
export * from "./session.mock";
