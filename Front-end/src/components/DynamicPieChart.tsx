import React from 'react';
import { View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

interface PieChartData {
  defectType: string;
  defectCount: number;
  percentage: number;
}

interface DynamicPieChartProps {
  data: PieChartData[];
  size?: number;
  strokeWidth?: number;
}

const DynamicPieChart: React.FC<DynamicPieChartProps> = ({ 
  data, 
  size = 140, 
  strokeWidth = 2 
}) => {
  // Dynamic color palette - expands based on data length
  const getColor = (index: number): string => {
    const colors = [
      '#3b82f6', // Blue
      '#ef4444', // Red  
      '#10b981', // Green
      '#f59e0b', // Yellow
      '#8b5cf6', // Purple
      '#f97316', // Orange
      '#06b6d4', // Cyan
      '#84cc16', // Lime
      '#ec4899', // Pink
      '#6b7280', // Gray
    ];
    return colors[index % colors.length];
  };

  // Calculate pie chart paths
  const createPieSlices = () => {
    if (!data || data.length === 0) return [];

    const center = size / 2;
    const radius = (size - strokeWidth * 2) / 2;
    let currentAngle = -90; // Start from top
    const spacing = 2; // Degrees of spacing between segments

    return data.map((item, index) => {
      const percentage = item.percentage;
      const sliceAngle = (percentage / 100) * 360 - spacing;
      
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      
      // Convert to radians
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;
      
      // Calculate arc points
      const x1 = center + radius * Math.cos(startAngleRad);
      const y1 = center + radius * Math.sin(startAngleRad);
      const x2 = center + radius * Math.cos(endAngleRad);
      const y2 = center + radius * Math.sin(endAngleRad);
      
      // Large arc flag
      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      
      // Create SVG path
      const pathData = [
        `M ${center} ${center}`, // Move to center
        `L ${x1} ${y1}`, // Line to start point
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Arc
        'Z' // Close path
      ].join(' ');
      
      currentAngle = endAngle + spacing; // Add spacing for next slice
      
      return {
        path: pathData,
        color: getColor(index),
        data: item
      };
    });
  };

  const pieSlices = createPieSlices();

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G>
          {pieSlices.map((slice, index) => (
            <Path
              key={index}
              d={slice.path}
              fill={slice.color}
              stroke="#ffffff"
              strokeWidth={strokeWidth}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
};

export default DynamicPieChart;
