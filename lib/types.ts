export interface Person {
  id: string;
  name: string;
  title: string;
  currentCompany: string;
  linkedinUrl?: string;
  photoUrl?: string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  isTarget?: boolean;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  attendeeCount: number;
}

export interface WorkHistory {
  company: string;
  title: string;
  from: string;
  to?: string;
  isCurrent: boolean;
}

export interface PersonWithHistory extends Person {
  workHistory: WorkHistory[];
  connections: Person[];
}

export interface GraphNode {
  id: string;
  name: string;
  type: "person" | "company";
  title?: string;
  isTarget?: boolean;
  industry?: string;
  photoUrl?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  type: "WORKS_AT" | "WORKED_AT" | "CONNECTED_TO";
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface Recommendation {
  person: Person;
  reason: string;
  reasonType: "works_at_target" | "former_target" | "connected_to_target";
  targetCompany: string;
  connectedPerson?: string;
}
