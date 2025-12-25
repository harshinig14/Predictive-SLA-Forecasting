
export interface Case {
  id: string;
  arrivalTime: number;
  priority: 'High' | 'Medium' | 'Low';
  slaDeadline: number;
  estimatedEffort: number; // minutes
  status: 'Pending' | 'In Progress' | 'Completed' | 'Breached';
}

export interface SimulationState {
  timestamp: number;
  queueLength: number;
  agentCount: number;
  arrivalRate: number; // cases per hour
  projectedBreachProbability: number; // 0-100
  activeCases: Case[];
  completedCount: number;
  breachCount: number;
}

export interface Scenario {
  id: string;
  name: string;
  agentAdjustment: number;
  priorityFocus: 'None' | 'High' | 'Urgent';
  results?: {
    breachReduction: number;
    avgWaitTimeChange: number;
    costImpact: number;
  };
}

export interface Agent {
  id: string;
  name: string;
  status: 'Online' | 'Busy' | 'Away';
  casesResolved: number;
  efficiency: number;
}

export type View = 'dashboard' | 'analytics' | 'team' | 'config';

export interface Insight {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
}
