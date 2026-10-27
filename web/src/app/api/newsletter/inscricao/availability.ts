import { resolveNewsletterAvailability } from "@/lib/server/newsletter-email";

// Only the public mode and Turnstile site key reach client components.
export const newsletterAvailability = () => resolveNewsletterAvailability(process.env);
