import * as apiSchemas from "./generated/api";
import * as apiTypes from "./generated/types";

export * from "./generated/api";
export * from "./generated/types";

// Re-export ambiguous identifiers to resolve TS2308
export const FaceMatchResponse = apiSchemas.FaceMatchResponse;
export type FaceMatchResponse = apiTypes.FaceMatchResponse;

export const LoginResponse = apiSchemas.LoginResponse;
export type LoginResponse = apiTypes.LoginResponse;
