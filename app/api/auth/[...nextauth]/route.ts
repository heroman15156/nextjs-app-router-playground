import NextAuth, { AuthOptions, RequestInternal, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginAction } from "@/app/actions/login-action";
import { tokenManager } from "@/app/lib/token-manger";

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined,
      ): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const authResponse = await loginAction({
            email: credentials.email,
            password: credentials.password,
          });

          tokenManager.setTokens(authResponse.tokens);

          return {
            id: authResponse.user.id,
            email: authResponse.user.email,
            name: authResponse.user.name,
            role: authResponse.user.role,
          };
        } catch (error: any) {
          throw new Error(
            JSON.stringify({
              statusCode: error.statusCode || 500,
              message: error.message || "알 수 없는 에러",
            }),
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
