import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlassian Connect Dashboard",
  description: "Connect and manage your Jira and Confluence workspaces",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
