import { Spline_Sans_Mono, Outfit } from "next/font/google";
import "./globals.css";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const splineSansMono = Spline_Sans_Mono({
  variable: "--font-spline",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "Arceas John Calzada - Portfolio",
  description: "Portfolio of Arceas John Calzada, UI/UX Designer and Developer.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${splineSansMono.variable} ${outfit.variable} antialiased`}>
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
