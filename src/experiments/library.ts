import { experiments } from "./registry";

export const categories = [
  { id: "all", label: "All experiments" },
  { id: "energy", label: "Energy" },
  { id: "spaces", label: "Spaces" },
  { id: "work", label: "Money & work" },
] as const;

export type Category = (typeof categories)[number]["id"];
export type ToolKind = "solar" | "power" | "battery" | "construction" | "paint" | "climate" | "finance" | "quote" | "furniture" | "work";

type DiscoveryContent = {
  kind: ToolKind;
  title: string;
  category: Exclude<Category, "all">;
  tagline: string;
  description: string;
  question: string;
  unit: string;
  inputs: string[];
  outputs: string[];
  keywords: string;
};

const discovery: Record<string, DiscoveryContent> = {
  solarcalc: {
    kind: "solar", title: "SolarCalc", category: "energy",
    tagline: "A brighter plan for your home.",
    description: "From the energy you use to the sunlight you could put to work.",
    question: "What could solar look like on my roof?", unit: "kWh / day",
    inputs: ["Daily energy use", "Sunlight hours", "Panel capacity"],
    outputs: ["An estimated panel count", "A clearer picture of roof space", "Energy assumptions you can understand"],
    keywords: "solar sunlight roof panels renewable watts sizing",
  },
  "electricity-consumption": {
    kind: "power", title: "Electricity Consumption", category: "energy",
    tagline: "Follow the flow.",
    description: "Get to know the everyday appliances behind your electricity bill.",
    question: "Where does my electricity go?", unit: "W → kWh",
    inputs: ["Appliance wattage", "Hours of use", "Electricity rate"],
    outputs: ["Consumption by appliance", "An estimated running cost", "A view of your biggest energy users"],
    keywords: "power appliances electricity bill consumption cost hours watts",
  },
  "battery-lab": {
    kind: "battery", title: "Battery Lab", category: "energy",
    tagline: "A little more staying power.",
    description: "Make sense of capacity, stored energy, and backup time.",
    question: "How much energy can I keep in reserve?", unit: "V × Ah = Wh",
    inputs: ["Battery voltage", "Capacity in amp-hours", "Connected load"],
    outputs: ["Stored energy", "An estimated runtime", "A view of capacity and load"],
    keywords: "battery storage backup capacity reserve voltage runtime outage",
  },
  "construction-materials": {
    kind: "construction", title: "Construction Materials", category: "spaces",
    tagline: "Measure twice. Plan once.",
    description: "Turn the dimensions in your sketch into a material plan.",
    question: "How much material will this project need?", unit: "m² / m³",
    inputs: ["Project dimensions", "Material type", "Waste allowance"],
    outputs: ["Estimated material quantities", "Area and volume", "A breakdown of the measurements"],
    keywords: "building construction concrete cement bricks blocks volume area materials",
  },
  "paint-calculator": {
    kind: "paint", title: "Paint Calculator", category: "spaces",
    tagline: "See the room differently.",
    description: "A fresh color starts with just the right amount of paint.",
    question: "How much paint will cover my walls?", unit: "m² → L",
    inputs: ["Wall dimensions", "Doors and windows", "Coats and paint coverage"],
    outputs: ["Paintable surface area", "Estimated paint quantity", "A coverage breakdown"],
    keywords: "paint walls room surface color colour coats liters litres coverage",
  },
  "climate-ac-calculator": {
    kind: "climate", title: "Climate / AC", category: "spaces",
    tagline: "Room for a little comfort.",
    description: "Find a sensible starting point for your room's cooling needs.",
    question: "What cooling capacity does my room need?", unit: "BTU / h",
    inputs: ["Room size", "Sun exposure", "Occupancy"],
    outputs: ["An estimated cooling load", "Room factors that matter", "A capacity range to explore"],
    keywords: "climate air conditioning ac cooling temperature airflow room heat btu",
  },
  "finance-calculator": {
    kind: "finance", title: "Finance", category: "work",
    tagline: "Put time on your side.",
    description: "See what happens when money, interest, and time meet.",
    question: "What will this loan cost over time?", unit: "$ / month",
    inputs: ["Principal amount", "Interest rate", "Loan term"],
    outputs: ["An estimated payment", "Interest over time", "An amortization breakdown"],
    keywords: "finance loan interest money payments amortization principal debt",
  },
  "quote-generator": {
    kind: "quote", title: "Quote Generator", category: "work",
    tagline: "Make your next proposal clear.",
    description: "Give your work a price, a scope, and a professional document.",
    question: "How do I turn my services into a clear quote?", unit: "Items → total",
    inputs: ["Services or products", "Quantities and rates", "Client details and terms"],
    outputs: ["An itemized estimate", "A clear total", "A document ready for review"],
    keywords: "quote estimate document client business proposal invoice services price",
  },
  "furniture-budget": {
    kind: "furniture", title: "Furniture Budget", category: "spaces",
    tagline: "Good ideas, built to budget.",
    description: "Bring materials, labor, and the finishing touches together.",
    question: "What will it cost to bring this piece to life?", unit: "Materials + labor",
    inputs: ["Parts and materials", "Labor hours", "Finishes and fittings"],
    outputs: ["A project budget", "A cost breakdown", "The contribution of each material"],
    keywords: "furniture wood desk table craft carpentry labor budget materials fittings",
  },
  "work-benefits-rd": {
    kind: "work", title: "Work Benefits RD", category: "work",
    tagline: "Every working day counts.",
    description: "A clearer way to explore time, salary, and work benefits in RD.",
    question: "How do my salary and time worked shape my benefits?", unit: "RD$ + time",
    inputs: ["Salary", "Employment dates", "Applicable benefit details"],
    outputs: ["An estimated benefits breakdown", "Time worked", "Visible assumptions and calculation context"],
    keywords: "work benefits dominican republic rd salary employment time severance prestaciones",
  },
};

// Discovery copy stays separate from the shared registry and future calculator logic.
export const libraryTools = experiments.map((experiment) => ({
  ...experiment,
  ...discovery[experiment.slug],
  availability: experiment.href ? "available" as const : "preview" as const,
}));

export type LibraryTool = (typeof libraryTools)[number];

export const chapters = [
  { id: "energy", title: "A brighter everyday.", description: "Understand what flows, what powers, and what lasts." },
  { id: "spaces", title: "Good ideas need a little space.", description: "From a fresh coat to a project built from scratch." },
  { id: "work", title: "Make the numbers mean something.", description: "For your next plan, proposal, or working chapter." },
] as const;
