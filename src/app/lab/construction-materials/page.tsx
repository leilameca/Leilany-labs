import type { Metadata } from "next";
import { ConstructionLab } from "./construction-lab";
export const metadata: Metadata = { title:"Construction Materials | LEILANY LABS", description:"Estimate concrete volume or masonry unit counts from project dimensions." };
export default function Page(){return <ConstructionLab />;}
