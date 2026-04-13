import { authComponent } from "./auth";
import { GenericCtx } from "@convex-dev/better-auth";
import { DataModel } from "./_generated/dataModel";

export async function requireUserId(ctx: GenericCtx<DataModel>): Promise<string> {
  const user = await authComponent.getAuthUser(ctx);
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user._id;
}
