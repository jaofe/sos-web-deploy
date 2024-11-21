import { Space_Grotesk } from "next/font/google";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"], // Specify the weights you want to use
});

export const metadata: Metadata = {
    title: "SOS Defesa Civil Maceió",
    description: "Sistema de Ocorrências e Registro de Defesa Civil Maceió",
    icons: {
        icon: "/logo_defesa_civil_maceio.png",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={spaceGrotesk.className}>
                {children}
                <Toaster />
            </body>
        </html>
    );
}
