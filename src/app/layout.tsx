import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Toaster } from "@/components/ui";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Recycle Fund — รับซื้อของเก่าถึงบ้าน",
  description: "ขายของเก่าง่าย ๆ นัดรับถึงบ้าน ติดตามสถานะ พร้อมลุ้นรางวัลทุกเดือน",
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <StoreProvider>
          <Shell>{children}</Shell>
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
