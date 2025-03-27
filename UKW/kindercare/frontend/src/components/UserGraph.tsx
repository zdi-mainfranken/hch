
import { useEffect, useState } from "react";
import { HealthMetric } from "../types/user";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { Calendar, Activity, LineChart as LineChartIcon, BarChart } from "lucide-react";

interface UserGraphProps {
  data: HealthMetric[];
  onNodeClick?: (userId: string) => void;
}

const UserGraph = ({ data }: UserGraphProps) => {
  const [activeMetrics, setActiveMetrics] = useState<{
    health: boolean;
    vitality: boolean;
    pain: boolean;
    mobility: boolean;
    mentalWellbeing: boolean;
  }>({
    health: true,
    vitality: true,
    pain: false,
    mobility: false,
    mentalWellbeing: false
  });

  const toggleMetric = (metric: keyof typeof activeMetrics) => {
    setActiveMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Format date for display on x-axis
  const formattedData = sortedData.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const chartConfig = {
    health: { 
      label: "Health", 
      theme: { light: "#3B82F6", dark: "#60A5FA" } 
    },
    vitality: { 
      label: "Vitality", 
      theme: { light: "#10B981", dark: "#34D399" } 
    },
    pain: { 
      label: "Pain", 
      theme: { light: "#EF4444", dark: "#F87171" } 
    },
    mobility: { 
      label: "Mobility", 
      theme: { light: "#F59E0B", dark: "#FBBF24" } 
    },
    mentalWellbeing: { 
      label: "Mental Well-being", 
      theme: { light: "#8B5CF6", dark: "#A78BFA" } 
    }
  };

  const emptyState = !data || data.length < 2;

  return (
    <div className="w-full h-full overflow-hidden rounded-xl glass p-4">
      <div className="w-full h-full relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-base font-medium">Health & Vitality Trends</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => toggleMetric('health')}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                activeMetrics.health 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
              }`}
            >
              Health
            </button>
            <button
              onClick={() => toggleMetric('vitality')}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                activeMetrics.vitality 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
              }`}
            >
              Vitality
            </button>
            <button
              onClick={() => toggleMetric('pain')}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                activeMetrics.pain 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' 
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
              }`}
            >
              Pain
            </button>
            <button
              onClick={() => toggleMetric('mobility')}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                activeMetrics.mobility 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' 
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
              }`}
            >
              Mobility
            </button>
            <button
              onClick={() => toggleMetric('mentalWellbeing')}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                activeMetrics.mentalWellbeing 
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' 
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
              }`}
            >
              Mental
            </button>
          </div>
        </div>

        {emptyState ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <LineChartIcon className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Health Data Available</h3>
            <p className="text-sm text-gray-500 max-w-md">
              This patient doesn't have enough health metrics recorded yet for trend analysis.
            </p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ChartContainer config={chartConfig} className="h-full">
              <LineChart data={formattedData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: 'gray' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: 'gray' }}
                  domain={[0, 100]}
                  label={{ 
                    value: 'Score', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 12, fill: 'gray' }
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent labelClassName="text-xs font-medium" />
                  }
                />
                <Legend />
                {activeMetrics.health && (
                  <Line 
                    type="monotone" 
                    dataKey="health" 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                )}
                {activeMetrics.vitality && (
                  <Line 
                    type="monotone" 
                    dataKey="vitality" 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                )}
                {activeMetrics.pain && (
                  <Line 
                    type="monotone" 
                    dataKey="pain" 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                )}
                {activeMetrics.mobility && (
                  <Line 
                    type="monotone" 
                    dataKey="mobility" 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                )}
                {activeMetrics.mentalWellbeing && (
                  <Line 
                    type="monotone" 
                    dataKey="mentalWellbeing" 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                )}
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserGraph;
