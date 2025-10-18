import "./globals.css";
import "react-day-picker/dist/style.css";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LangProvider } from "@/components/i18n/lang";

export const metadata: Metadata = {
  title: {
    default: "Green & Grey — Booking",
    template: "%s — Green & Grey",
  },
  description: "Villa, Jeep, Rent, Dokumentasi — satu checkout",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col antialiased has-sticky">
        <LangProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
