import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbConnect } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials", // Name of the provider(optional)
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          await dbConnect();
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            throw new Error("User not found");
          }
          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) {
                throw new Error("Invalid password");
            }
            return {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
            }


        } catch (error) {
            console.error("Error during authorization:", error);
            throw new Error("Authorization failed");
        }
      },
    }),

  ],
};
