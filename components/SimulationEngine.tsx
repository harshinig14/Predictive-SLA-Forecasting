
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SimulationState, Case } from '../types';

interface EngineProps {
  onUpdate: (state: SimulationState) => void;
  baseAgents: number;
}

const SimulationEngine: React.FC<EngineProps> = ({ onUpdate, baseAgents }) => {
  const [state, setState] = useState<SimulationState>({
    timestamp: Date.now(),
    queueLength: 150,
    agentCount: baseAgents,
    arrivalRate: 25,
    projectedBreachProbability: 68,
    activeCases: [],
    completedCount: 0,
    breachCount: 0,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const tick = useCallback(() => {
    setState(prev => {
      // Logic to simulate arrivals and completions
      const arrivals = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0;
      
      // Each agent can process a certain amount of "work units" per tick
      // On average an agent takes 45 mins per case. Tick is ~2 seconds real time.
      // Scaling for simulation speed.
      const processingPower = prev.agentCount * 0.05; 
      const completions = Math.random() < processingPower ? 1 : 0;
      
      const newBreach = (prev.queueLength > 200 && Math.random() > 0.95) ? 1 : 0;
      
      const newQueueLength = Math.max(0, prev.queueLength + arrivals - completions);
      
      // Calculate probability based on queue length vs agent count
      const capacityRatio = newQueueLength / (prev.agentCount * 10 || 1);
      const newProb = Math.min(100, Math.round(capacityRatio * 35));

      const newState = {
        ...prev,
        timestamp: Date.now(),
        queueLength: newQueueLength,
        agentCount: baseAgents, // Fixed by prop for now
        projectedBreachProbability: newProb,
        completedCount: prev.completedCount + completions,
        breachCount: prev.breachCount + newBreach,
      };

      return newState;
    });
  }, [baseAgents]);

  useEffect(() => {
    const interval = setInterval(tick, 2000);
    return () => clearInterval(interval);
  }, [tick]);

  useEffect(() => {
    onUpdate(state);
  }, [state, onUpdate]);

  return null; // Logic only component
};

export default SimulationEngine;
