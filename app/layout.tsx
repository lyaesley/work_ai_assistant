import type { Metadata } from "next";
import "./globals.css";
import NavBarWrapper from "@/components/layout/NavBarWrapper";

export const metadata: Metadata = {
  title: "AI 업무 가이드",
  description: "직책과 상황을 이해하고 지금 해야 할 일을 알려주는 AI 업무 비서",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50">
        <NavBarWrapper />
        {children}
      </body>
    </html>
  );
}
