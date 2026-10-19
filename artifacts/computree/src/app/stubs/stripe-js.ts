// Stub for '@stripe/stripe-js'. It is an optional peer of @stripe/crypto,
// which @privy-io/react-auth pulls in for fiat on-ramp flows this app never
// invokes. Aliased in vite.config.ts so the dep optimizer can pre-bundle
// Privy without installing the real Stripe package.
export const loadStripe = () => Promise.resolve(null);
export default {};
