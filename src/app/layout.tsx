import "./globals.css";
import { Providers } from "@/utils/providers/layout_provider";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'CalorEase - Your Personal Nutrition Companion',
  description: 'Track calories, discover recipes, and achieve your wellness goals with CalorEase.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
