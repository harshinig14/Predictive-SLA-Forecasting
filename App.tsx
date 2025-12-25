
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SimulationState, Scenario, View, Agent } from './types';
import SimulationEngine from './components/SimulationEngine';
import PredictiveChart from './components/PredictiveChart';
import { geminiService } from './services/geminiService';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  Clock, 
  Play, 
  Plus, 
  Zap, 
  LayoutDashboard, 
  Settings,
  HelpCircle,
  TrendingUp,
  BarChart3,
  ChevronRight,
  ShieldCheck,
  Cpu,
  RefreshCcw,
  UserCheck
} from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [currentState, setCurrentState] = useState<SimulationState | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [agentAdjustment, setAgentAdjustment] = useState(8);
  const [simSpeed, setSimSpeed] = useState(1);

  // Simulated Team Data
  const team: Agent[] = useMemo(() => [
    { id: '1', name: 'Sarah Connor', status: 'Online', casesResolved: 45, efficiency: 94 },
    { id: '2', name: 'James Smith', status: 'Busy', casesResolved: 38, efficiency: 88 },
    { id: '3', name: 'Elena Rodriguez', status: 'Online', casesResolved: 52, efficiency: 97 },
    { id: '4', name: 'Michael Chen', status: 'Away', casesResolved: 29, efficiency: 82 },
    { id: '5', name: 'Aisha Khan', status: 'Online', casesResolved: 41, efficiency: 91 },
    { id: '6', name: 'David Wilson', status: 'Busy', casesResolved: 33, efficiency: 85 },
  ], []);

  const handleSimUpdate = useCallback((state: SimulationState) => {
    setCurrentState(state);
    setHistory(prev => {
      const newHistory = [...prev, {
        time: new Date(state.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actual: state.queueLength,
        predicted: state.queueLength + (state.arrivalRate * 0.5),
        upperBound: state.queueLength + (state.arrivalRate * 0.8),
        lowerBound: state.queueLength + (state.arrivalRate * 0.2),
      }];
      if (newHistory.length > 20) return newHistory.slice(1);
      return newHistory;
    });
  }, []);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!currentState || currentView !== 'dashboard') return;
      setLoadingInsights(true);
      const insights = await geminiService.analyzeCurrentState(currentState);
      if (insights) setAiInsights(insights);
      setLoadingInsights(false);
    };

    const interval = setInterval(fetchInsights, 30000);
    fetchInsights();
    return () => clearInterval(interval);
  }, [currentState?.queueLength, currentView]);

  const runScenario = async () => {
    if (!currentState) return;
    const newScenario: Scenario = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Add ${Math.abs(agentAdjustment - 8)} Agents`,
      agentAdjustment: agentAdjustment - 8,
      priorityFocus: 'None'
    };
    
    setLoadingInsights(true);
    const evaluation = await geminiService.evaluateScenario(currentState, newScenario);
    if (evaluation) {
      newScenario.results = evaluation;
    }
    setScenarios(prev => [newScenario, ...prev].slice(0, 5));
    setLoadingInsights(false);
  };

  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Clock className="w-12 h-12" />
          </div>
          <p className="text-slate-400 text-sm mb-1">Queue Size</p>
          <h3 className="text-4xl font-bold text-white mb-2">{currentState?.queueLength || '---'}</h3>
          <div className="flex items-center gap-1 text-red-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            +12% vs last hour
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group border-l-4 border-l-orange-500">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <p className="text-slate-400 text-sm mb-1">SLA Breach Risk (4h)</p>
          <h3 className="text-4xl font-bold text-white mb-2">
            {currentState?.projectedBreachProbability || '---'}%
          </h3>
          <p className="text-xs text-slate-500">High volatility detected</p>
        </div>
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group border-l-4 border-l-blue-500">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Users className="w-12 h-12" />
          </div>
          <p className="text-slate-400 text-sm mb-1">Active Agents</p>
          <h3 className="text-4xl font-bold text-white mb-2">{currentState?.agentCount || '---'}</h3>
          <p className="text-xs text-blue-400 font-medium">85% Utilization</p>
        </div>
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Activity className="w-12 h-12" />
          </div>
          <p className="text-slate-400 text-sm mb-1">Total Breaches</p>
          <h3 className="text-4xl font-bold text-white mb-2">{currentState?.breachCount || 0}</h3>
          <p className="text-xs text-slate-500">Current shift</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-bold text-white">Predictive Queue Forecast</h4>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 rounded-full bg-red-500"></span> Actual
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span> Forecast
              </span>
            </div>
          </div>
          <PredictiveChart data={history} />
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <h4 className="text-lg font-bold text-white">Gemini Insights</h4>
            </div>
            {loadingInsights && <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />}
          </div>
          {aiInsights ? (
            <div className="space-y-4">
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <p className="text-sm text-blue-100 leading-relaxed italic">"{aiInsights.summary}"</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500 font-bold mb-3 tracking-widest">Priority Actions</p>
                <ul className="space-y-2">
                  {aiInsights.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-300">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-800 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <Activity className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Synthesizing live queue data...</p>
            </div>
          )}
        </div>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-6 h-6 text-purple-400" />
          <h4 className="text-2xl font-bold text-white">What-If Scenario Sandbox</h4>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="glass-panel rounded-2xl p-6">
            <h5 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">Parameters</h5>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Target Agents</span>
                  <span className="text-blue-400 font-bold">{agentAdjustment}</span>
                </div>
                <input 
                  type="range" min="1" max="20" value={agentAdjustment}
                  onChange={(e) => setAgentAdjustment(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Priority Strategy</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Standard (First In First Out)</option>
                  <option>Urgent First (High SLA Risk)</option>
                  <option>Efficiency Mode (Easiest First)</option>
                </select>
              </div>
              <button onClick={runScenario} disabled={loadingInsights} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                <Play className="w-4 h-4" /> Run Virtual Simulation
              </button>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scenarios.length > 0 ? scenarios.map((scenario) => (
                <div key={scenario.id} className="glass-panel rounded-2xl p-5 border border-purple-500/20 hover:border-purple-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-purple-400 uppercase">{scenario.name}</span>
                    <div className="px-2 py-1 rounded bg-purple-500/20 text-[10px] font-bold text-purple-300">PROJECTED</div>
                  </div>
                  {scenario.results ? (
                    <>
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-green-400">-{scenario.results.breachReduction}%</p>
                        <p className="text-xs text-slate-500">Breach Probability</p>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed italic border-t border-slate-800 pt-3">"{scenario.results.recommendation}"</p>
                    </>
                  ) : (
                    <div className="animate-pulse space-y-2">
                      <div className="h-8 bg-slate-800 rounded w-1/2"></div>
                      <div className="h-4 bg-slate-800 rounded w-full"></div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="md:col-span-3 flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-800 rounded-2xl text-slate-600">
                  <Plus className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No scenarios running. Adjust parameters and click Run.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );

  const renderAnalytics = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel rounded-2xl p-6">
          <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" /> Case Distribution
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={[
                    { name: 'Billing', value: 400 },
                    { name: 'Technical', value: 300 },
                    { name: 'General', value: 300 },
                    { name: 'Onboarding', value: 200 }
                  ]} 
                  innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                >
                  {COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
             {['Billing', 'Technical', 'General', 'Onboarding'].map((label, i) => (
               <div key={label} className="flex items-center gap-2 text-sm text-slate-400">
                 <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                 {label}
               </div>
             ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" /> Hourly Arrival Rates
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                {hour: '08:00', cases: 12}, {hour: '09:00', cases: 25}, {hour: '10:00', cases: 42},
                {hour: '11:00', cases: 38}, {hour: '12:00', cases: 18}, {hour: '13:00', cases: 35},
                {hour: '14:00', cases: 48}, {hour: '15:00', cases: 52}, {hour: '16:00', cases: 39}
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155'}} />
                <Bar dataKey="cases" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <h4 className="text-xl font-bold text-white mb-6">Historical Performance Matrix</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs uppercase text-slate-500 font-bold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Metric</th>
                <th className="px-4 py-3">Week to Date</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr className="hover:bg-slate-800/30">
                <td className="px-4 py-4 text-white font-medium">SLA Resolution Rate</td>
                <td className="px-4 py-4">92.4%</td>
                <td className="px-4 py-4">95.0%</td>
                <td className="px-4 py-4 text-red-400 font-bold">-2.6%</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="px-4 py-4 text-white font-medium">Average Wait Time</td>
                <td className="px-4 py-4">12.5m</td>
                <td className="px-4 py-4">10.0m</td>
                <td className="px-4 py-4 text-orange-400 font-bold">+2.5m</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="px-4 py-4 text-white font-medium">CSAT Score</td>
                <td className="px-4 py-4">4.8/5.0</td>
                <td className="px-4 py-4">4.5/5.0</td>
                <td className="px-4 py-4 text-green-400 font-bold">+0.3</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTeamStatus = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xl font-bold text-white">Live Operations Team</h4>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-bold">4 Online</span>
           <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-xs font-bold">2 Busy</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((agent) => (
          <div key={agent.id} className="glass-panel rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-400 border border-slate-700">
                  {agent.name.charAt(0)}
                </div>
                <div>
                  <h5 className="font-bold text-white group-hover:text-blue-400 transition-colors">{agent.name}</h5>
                  <p className="text-xs text-slate-500">Senior Support Rep</p>
                </div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${agent.status === 'Online' ? 'bg-green-500' : agent.status === 'Busy' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-slate-600'}`}></div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="text-xs text-slate-500">Cases Resolved</div>
                <div className="text-lg font-bold text-white">{agent.casesResolved}</div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Efficiency Rating</span>
                  <span className="text-blue-400">{agent.efficiency}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{width: `${agent.efficiency}%`}}></div>
                </div>
              </div>
              <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                <UserCheck className="w-4 h-4" /> View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConfig = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-panel rounded-2xl p-8 border border-slate-700">
        <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Cpu className="w-7 h-7 text-blue-400" /> Digital Twin Configuration
        </h4>
        
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-300">Simulation Speed Factor</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="0.1" max="5" step="0.1" value={simSpeed}
                  onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="w-12 text-center font-mono text-blue-400">{simSpeed}x</span>
              </div>
              <p className="text-xs text-slate-500">Accelerates the digital twin relative to real-world time.</p>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-300">Sync Frequency</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white">
                <option>Real-time (WebSocket)</option>
                <option>5 Seconds (Adaptive Polling)</option>
                <option>30 Seconds (Low Energy)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <h5 className="text-lg font-bold text-white mb-4">Risk Thresholds</h5>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 font-medium">Critical SLA Alert Threshold</p>
                  <p className="text-xs text-slate-500 italic">Trigger visual alerts when breach risk exceeds this %.</p>
                </div>
                <div className="w-24">
                  <input type="number" defaultValue={70} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-center" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 font-medium">Auto-Scenario Generation</p>
                  <p className="text-xs text-slate-500 italic">Gemini will automatically test mitigations during peaks.</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex gap-4">
            <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Save Changes
            </button>
            <button className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all flex items-center gap-2">
              <RefreshCcw className="w-5 h-5" /> Reset Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a] text-slate-200">
      <SimulationEngine onUpdate={handleSimUpdate} baseAgents={agentAdjustment} />

      <aside className="w-64 border-r border-slate-800 flex flex-col glass-panel shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">TwinSight</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-all ${currentView === 'dashboard' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('analytics')}
            className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-all ${currentView === 'analytics' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <BarChart3 className="w-5 h-5" /> Analytics
          </button>
          <button 
            onClick={() => setCurrentView('team')}
            className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-all ${currentView === 'team' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <Users className="w-5 h-5" /> Team Status
          </button>
          <button 
            onClick={() => setCurrentView('config')}
            className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-all ${currentView === 'config' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" /> Config
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold mb-2">
              <Activity className="w-4 h-4" /> Digital Twin Active
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">Real-time synchronization with production queues at 5s latency.</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth">
        <header className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1 uppercase tracking-widest font-bold">
              View <ChevronRight className="w-4 h-4" /> {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {currentView === 'dashboard' && 'Operations Overview'}
              {currentView === 'analytics' && 'Operational Intelligence'}
              {currentView === 'team' && 'Human Resources'}
              {currentView === 'config' && 'System Parameters'}
            </h2>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-xs uppercase text-slate-500 font-bold tracking-wider">Simulation Clock</p>
              <p className="text-xl font-mono text-white">
                {new Date(currentState?.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>
        </header>

        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'analytics' && renderAnalytics()}
        {currentView === 'team' && renderTeamStatus()}
        {currentView === 'config' && renderConfig()}
      </main>

      <div className="fixed bottom-8 right-8 w-80 pointer-events-none">
        <div className="space-y-3 pointer-events-auto">
          {currentState && currentState.projectedBreachProbability > 70 && (
            <div className="bg-red-500/90 text-white p-4 rounded-xl shadow-2xl backdrop-blur-md animate-bounce border border-red-400">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertTriangle className="w-5 h-5" /> CRITICAL SLA RISK
              </div>
              <p className="text-xs opacity-90">Breach probability reached {currentState.projectedBreachProbability}%. Immediate intervention recommended.</p>
            </div>
          )}
          <div className="bg-slate-900/90 text-slate-300 p-4 rounded-xl shadow-lg backdrop-blur-md border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">System Events</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <div className="space-y-2 max-h-40 overflow-hidden">
               <div className="text-[11px] flex justify-between">
                  <span>New Case Arrived #4211</span>
                  <span className="text-slate-600">Just now</span>
               </div>
               <div className="text-[11px] flex justify-between">
                  <span>Case Completed #4208</span>
                  <span className="text-slate-600">2m ago</span>
               </div>
               <div className="text-[11px] flex justify-between">
                  <span>SLA Forecast Updated</span>
                  <span className="text-slate-600">5m ago</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
