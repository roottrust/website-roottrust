"use client";

import { createContext, useContext, type ReactNode } from "react";

const MethodContext = createContext<ReactNode>(null);

export function MethodSlot({ method, children }: { method: ReactNode; children: ReactNode }) {
  return <MethodContext.Provider value={method}>{children}</MethodContext.Provider>;
}

export const useMethodSlot = () => useContext(MethodContext);
