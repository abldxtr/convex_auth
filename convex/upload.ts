import { httpAction, internalMutation, mutation } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const generateUploadUrlInternal = internalMutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const postMessage = httpAction(async (ctx, request) => {
  const { author, body } = await request.json();

  // await ctx.runMutation(internal.messages.sendOne, {
  //   body: `Sent via HTTP action: ${body}`,
  //   author,
  // });
  // const ddd = await ct

  return new Response(null, {
    status: 200,
  });
});
