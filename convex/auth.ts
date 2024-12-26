import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

import { DataModel } from "./_generated/dataModel";

const CustomPassword = Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      name: params.name as string,
    };
  },
  validatePasswordRequirements: (password: string) => {
    if (password.length < 5) {
      throw new ConvexError("Invalid password.");
    }
  },
});

export const { auth, signIn, signOut, store,isAuthenticated } = convexAuth({
  providers: [CustomPassword],
});
