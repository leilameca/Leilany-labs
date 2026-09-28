export type ExperimentStatus = "featured" | "selected" | "planned";

export type ExperimentDefinition = {
  number: string;
  slug: string;
  name: string;
  shortName: string;
  href?: string;
  discipline: string;
  status: ExperimentStatus;
  palette: {
    primary: string;
    secondary: string;
    signal: string;
  };
  visualLanguage: string;
  formulaHint: string;
};
