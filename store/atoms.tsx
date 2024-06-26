"use client";
import { atom } from "recoil";

export enum AuthStatus {
	Authenticated,
	Unauthenticated,
	Authenticating,
}

export interface AuthTokensType {
	accessToken: string | null;
	refreshToken: string | null;
	scopes: string | null;
	expires_in: string | null;
}

export const authTokensAtom = atom<AuthTokensType>({
	key: "authTokens",
	default: {
		accessToken: null,
		refreshToken: null,
		scopes: null,
		expires_in: null,
	},
});

export const AuthStatusAtom = atom<AuthStatus>({
	key: "authStatus",
	default: AuthStatus.Unauthenticated,
});

export const UserAtom = atom<any>({
	key: "user",
	default: {
		undefined,
	},
});
