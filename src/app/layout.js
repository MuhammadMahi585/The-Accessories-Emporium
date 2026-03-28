import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { AuthProvider } from "./context/AuthContext";
import "./globals.css";
import Script from "next/script"; 

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "The Accesories Emporium",
  description: "Computer products, accessories, and customer portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-3084047545747464"></meta>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3084047545747464"
        crossOrigin="anonymous"
      />
      </head>
      <body className={`${jakartaSans.variable} ${spaceGrotesk.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
