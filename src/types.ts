export type TaskStatus = 'Not started' | 'In progress' | 'Blocked' | 'Done';

export type TaskCategory = 
  | 'Site Survey' 
  | 'Network & Cabling' 
  | 'Camera Mounting' 
  | 'NVR & Server Setup' 
  | 'Testing & Commissioning' 
  | 'Client Handover';

export interface CCTVTask {
  id: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  owner: string;
  targetDate?: string;
  completedDate?: string;
  blockerReason?: string;
}

export interface RiskItem {
  id: string;
  description: string;
  impact: 'low' | 'med' | 'high';
  likelihood: 'low' | 'med' | 'high';
  signal: string;
  mitigation: string;
  owner: string;
  dueDate?: string;
}

export interface BlockerItem {
  id: string;
  description: string;
  owner: string;
  since: string;
  unblockAction: string;
  resolved: boolean;
}

export interface DecisionItem {
  id: string;
  decision: string;
  date: string;
  decisionMaker: string;
  whatChanged: string;
}

export interface CameraEndpoint {
  id: string;
  name: string;
  zone: string;
  lens: string;
  ip: string;
  port: string;
  status: 'Mounted' | 'Pending Power';
}

export interface TechnicianMember {
  id: string;
  name: string;
  role: string;
  status: 'On Site' | 'Remote' | 'Off Duty';
  assigned: string;
  email: string;
}

export interface ProjectNote {
  id: string;
  author: string;
  authorRole: 'client' | 'installer';
  content: string;
  createdAt: string;
}

export interface CCTVProject {
  id: string;
  name: string;
  goal: string;
  location: string;
  targetLaunchDate: string;
  startDate: string;
  teamLead: string;
  updateCadence: 'Daily' | 'Weekly';
  audience: 'Team' | 'Exec' | 'Client';
  totalCameras: number;
  installedCameras: number;
  tasks: CCTVTask[];
  risks: RiskItem[];
  blockers: BlockerItem[];
  decisions: DecisionItem[];
  cameras?: CameraEndpoint[];
  technicians?: TechnicianMember[];
  notes?: ProjectNote[];
}

export interface ExecutiveStatus {
  overall: 'Green' | 'Yellow' | 'Red';
  overallReason: string;
  schedule: 'On track' | 'At risk' | 'Off track';
  scope: 'Stable' | 'Expanding' | 'Unclear';
  resourcing: 'Adequate' | 'Tight' | 'Insufficient';
  keyAsk: string;
}

export interface HealthScore {
  schedule: number; // 0-5
  scope: number;     // 0-5
  quality: number;   // 0-5
  resourcing: number;// 0-5
  risk: number;      // 0-5
  total: number;     // 0-25
  facts: string[];
  inferences: string[];
}

export interface AssistantUpdateReport {
  executiveStatus: ExecutiveStatus;
  progressBullets: string[];
  next7DaysBullets: string[];
  risks: RiskItem[];
  blockers: BlockerItem[];
  decisions: DecisionItem[];
  openQuestions: string[];
  healthScore?: HealthScore;
  endingPhrase: string;
}

export type UserRole = 'client' | 'installer';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  title: string;
}
