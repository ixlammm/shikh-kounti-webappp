import NextAuth, { Account, Session, User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { decode, encode, JWT, JWTDecodeParams, JWTEncodeParams } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { env } from "process";
import jwt from "jose"

export const {handlers, signIn, signOut, auth} = NextAuth({
    providers: [GoogleProvider],
    callbacks: {
        async jwt(params:  { token: JWT, user: User }) {
            let token = params.token;
            if (params.user) {
                token.email = params.user.email ?? 'no-mail';
            }
            return token;
        },

        async session(params: { session: Session, token: JWT }) {
            let session = params.session;
            (session.user as unknown as any).token = params.token;
            // (session.user as unknown as any) = {
            //     ...session.user,
            //     admin: true,
            //     token: params.token
            // }
            return session
        }
    },
    cookies: {
        sessionToken: {
            name: env.COOKIE_SESSION_TOKEN_NAME,
            options: {
                httpOnly: false,
                path: '/',
                sameSite: 'lax',
                secure: false,
                domain: env.COOKIE_SESSION_TOKEN_DOMAIN
            }
        }
    }
})