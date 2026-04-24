/** Stubs for editors; runtime is Deno on Supabase Edge. */
declare const Deno: {
  env: { get(key: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};
