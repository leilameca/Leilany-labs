import type { Metadata } from "next";
import { BatteryLab } from "./battery-lab";
export const metadata: Metadata = { title: "Battery Lab | LEILANY LABS", description: "Explore battery bank capacity and estimated backup runtime." };
export default function Page() { return <BatteryLab />; }
