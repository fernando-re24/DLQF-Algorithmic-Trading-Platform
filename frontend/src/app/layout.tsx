import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "DLQF Algorithmic Trading Platform",
  description: "Submit and evaluate algorithmic trading strategies",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
        {children}
      </body>
    </html>
  );
}
