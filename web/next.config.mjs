import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
  poweredByHeader: false,
  // The report PDFs are read at runtime only by the internal jobs route; keep them out of every other trace.
  outputFileTracingIncludes: { "/api/internal/jobs/process": ["./private/reports/*.pdf"] },
};

export default nextConfig;
