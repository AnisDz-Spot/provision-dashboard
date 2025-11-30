import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const providers = [];

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  );
}

if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    })
  );
}

export const authOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET || process.env.SUPABASE_KEYS_ENCRYPTION_KEY,
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }: any) {
      // Keep token as-is; providers will populate it
      return token;
    },
    async session({ session, token, user }: any) {
      // Expose token on session for client if needed
      (session as any).token = token;
      return session;
    },
  },
};

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
