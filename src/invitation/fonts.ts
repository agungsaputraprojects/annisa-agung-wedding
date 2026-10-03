import { Amiri, Fraunces, Manrope } from "next/font/google";

export const serif = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], axes: ["SOFT", "opsz"], variable: "--s-serif", display: "swap" });
export const sans = Manrope({ subsets: ["latin"], variable: "--s-sans", display: "swap" });
export const arab = Amiri({ subsets: ["arabic"], weight: "400", variable: "--s-arab", display: "swap" });
export const fontVars = `${serif.variable} ${sans.variable} ${arab.variable}`;
