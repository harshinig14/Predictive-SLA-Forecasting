
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

interface ChartData {
  time: string;
  actual: number;
  predicted: number;
  upperBound: number;
  lowerBound: number;
}

interface PredictiveChartProps {
  data: ChartData[];
}

const PredictiveChart: React.FC<PredictiveChartProps> = ({ data }) => {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            label={{ value: 'Cases', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="upperBound" 
            stroke="none" 
            fill="#3b82f6" 
            fillOpacity={0.05} 
            connectNulls
          />
          <Area 
            type="monotone" 
            dataKey="predicted" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPredicted)" 
          />
          <Area 
            type="monotone" 
            dataKey="actual" 
            stroke="#ef4444" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorActual)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PredictiveChart;
