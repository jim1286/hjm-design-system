/** Avatar owns the accessible name; fallback artwork must remain decorative. */
export type AvatarFallbackContext = Readonly<{ size: number; decorative: true }>;
export type BlobatarFallbackOptions = Readonly<{
  /** Stable public product identifier, never a default email or display name. */
  seed: string;
  expression?: "idle" | "happy";
}>;
export function resolveBlobatarFallback(options: BlobatarFallbackOptions): Required<BlobatarFallbackOptions> {
  if (typeof options.seed !== "string" || !options.seed.trim()) throw new TypeError("Avatar seed must not be empty");
  const expression = options.expression ?? "idle";
  if (expression !== "idle" && expression !== "happy") throw new TypeError("Unsupported avatar expression");
  // Preserve exact identifiers: normalizing case would merge distinct accounts.
  return { seed: options.seed, expression };
}

export type BlobatarMotionExpression = 'idle'|'happy'|'sad'|'surprised'|'wink'|'sleepy'|'thinking';
export type BlobatarMotionOptions = Readonly<{seed:string;expression?:BlobatarMotionExpression;active?:boolean;visible?:boolean}>;
export function resolveBlobatarMotion(options:BlobatarMotionOptions){
 resolveBlobatarFallback({seed:options.seed});
 const expression=options.expression??'idle';if(!['idle','happy','sad','surprised','wink','sleepy','thinking'].includes(expression))throw new TypeError('Unsupported animated avatar expression');
 return {seed:options.seed,expression,active:options.active??false,visible:options.visible??true};
}
