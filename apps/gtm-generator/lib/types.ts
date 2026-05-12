export interface CompanyIntel {
  companyName: string;
  websiteUrl: string;
  offer: string;
  icp: string;
  differentiators: string[];
  industryVertical: string;
  targetTitles: string[];
}

export interface ResearchIntel {
  industryTrends: string[];
  competitorMoves: string[];
  redditComplaints: string[];
  macroContext: string;
}

export type PlayType =
  | "Signal Play"
  | "ICP Play"
  | "Competitor Play"
  | "Trigger Play"
  | "Pain Play"
  | "Timing Play"
  | "Account-Based Play";

export type Difficulty = "Easy" | "Medium" | "Advanced";
export type ResponseRateTier = "High" | "Medium" | "Niche";

export interface Play {
  id: string;
  name: string;
  type: PlayType;
  angle: string;
  difficulty: Difficulty;
  responseRateTier: ResponseRateTier;
  playbook?: Playbook;
  copy?: CopySet;
}

export interface Playbook {
  fullDescription: string;
  messagingAngle: string;
  steps: string[];
  aiArkFields: AIArkFields;
  apolloFields: ApolloFields;
  estimatedListSize: string;
  whyItWorks: string;
}

export interface AIArkFields {
  jobTitles: string[];
  jobTitlesExclude: string[];
  companySizeMin: number;
  companySizeMax: number;
  industries: string[];
  keywords: string[];
  seniorityLevels: string[];
  geographies: string[];
  signals?: string[];
}

export interface ApolloFields {
  personTitles: string[];
  excludedTitles: string[];
  employeeRanges: string[];
  industries: string[];
  keywords: string[];
  seniorityLevels: string[];
  locations: string[];
}

export interface EmailVariant {
  framework: string;
  subjectLines: string[];
  emailBody: string;
  followUp: string;
  whyItWorks: string;
}

export interface CopySet {
  variant1: EmailVariant;
  variant2: EmailVariant;
}

export interface LeadCapture {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  selectedPlayIds: string[];
}

export interface AppState {
  stage: 1 | 2 | 3;
  websiteUrl: string;
  companyName: string;
  userEmail: string;
  companyIntel: CompanyIntel | null;
  researchIntel: ResearchIntel | null;
  plays: Play[];
  selectedPlays: Play[];
  leadCapture: LeadCapture | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
}
