import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VitaCalc — Free Health Calculators",
  description:
    "Calculate your BMI, daily calorie needs, and exact age with simple, private tools.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
