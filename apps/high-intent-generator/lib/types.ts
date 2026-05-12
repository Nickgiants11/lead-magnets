export interface CompanyIntel {
  // Set by the scrape route — present at runtime even if not in all prompts
  companyName?: string;
  websiteUrl?: string;
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

export interface DataSourceStep {
  tool: string;
  action: string;
  filters?: string[];
}

export interface AiArkFields {
  jobTitles: string[];
  excludeTitles: string[];
  companySizeMin: number;
  companySizeMax: number;
  industries: string[];
  keywords: string[];
  seniority: string[];
  geography: string[];
  signals: string[];
}

export interface ApolloFields {
  personTitles: string[];
  excludedTitles: string[];
  employeeRanges: string[];
  industries: string[];
  keywords: string[];
  seniority: string[];
  locations: string[];
}

export interface SignalPlaybook {
  signalDefinition: string;
  whyHighIntent: string;
  dataSourceSteps: DataSourceStep[];
  aiArkFields: AiArkFields;
  apolloFields: ApolloFields;
  estimatedListSize: string;
  conversionContext: string;
  whyItWorks: string;
}

export interface ScriptVariant {
  framework: string;
  medium: 'email' | 'linkedin';
  subjectLines: string[];
  emailBody: string;
  followUp: string;
  whyItWorks: string;
}

export interface SignalScripts {
  variant1: ScriptVariant;
  variant2: ScriptVariant;
}

export interface SignalCampaign {
  id: string;
  name: string;
  signalType: string;
  angle: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  conversionTier: 'Highest' | 'High' | 'Medium';
  playbook?: SignalPlaybook;
  scripts?: SignalScripts;
}

export interface LeadCapture {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export interface AppState {
  stage: number;
  websiteUrl: string;
  companyName: string;
  userEmail: string;
  companyIntel?: CompanyIntel;
  researchIntel?: ResearchIntel;
  campaigns?: SignalCampaign[];
  selectedCampaigns?: SignalCampaign[];
  leadCapture?: LeadCapture;
}
