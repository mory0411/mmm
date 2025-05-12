import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Header from '@/components/Header';
import { Toaster } from "sonner";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "MORY - 기억은 관계를 잇는 매개체",
  description: "가족과의 소중한 대화를 기록하고 나누는 공간",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${notoSansKr.variable} font-sans antialiased`}
      >
        <Header />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
