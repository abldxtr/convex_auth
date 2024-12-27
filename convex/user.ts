import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUser = query({
  args: {
    /* ... */
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    // const identity = await ctx.auth.getUserIdentity();
    // const { tokenIdentifier, name, email } = identity!;
    if (userId === null) {
      //   throw new Error("Client is not authenticated!");
      return null;
    }
    // if (identity === null) {
    //   // throw new Error("Unauthenticated call to mutation");
    //   return null;
    // }
    // console.log({ email });
    const user = await ctx.db.get(userId);
    // console.log({ user });

    // console.log({ userId });

    return user;
    // ...
  },
});
