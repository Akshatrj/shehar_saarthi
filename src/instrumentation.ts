export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { bootstrapServerEnv } = await import("@/lib/bootstrap-env");
    bootstrapServerEnv();
  }
}
