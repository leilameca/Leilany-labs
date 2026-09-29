import type { Metadata } from "next";
import { PaintLab } from "./paint-lab";
export const metadata:Metadata={title:"Paint Calculator | LEILANY LABS",description:"Plan wall coverage, paint quantity and containers for a rectangular room."};
export default function Page(){return <PaintLab/>;}
