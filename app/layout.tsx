import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: "Glow Beauty Spa | Trợ lý AI Tư vấn 24/7",
  description: "Trải nghiệm dịch vụ làm đẹp đẳng cấp tại Glow Beauty Spa. Trợ lý AI thông minh sẵn sàng hỗ trợ bạn đặt lịch và tư vấn dịch vụ 24/7.",
};

import ChatWidget from "@/components/ChatWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} ${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
