import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';

interface SeverityPieChartProps {
  data: {
    statuses: {
      [key: string]: {
        color: string;
        count: number;
      };
    };
    total: number;
  };
  severityLevel: 'high' | 'medium' | 'low';
  size?: number;
}

const SeverityPieChart: React.FC<SeverityPieChartProps> = ({ 
  data, 
  severityLevel, 
  size = 200 
}) => {
  const radius = size * 0.35;
  const centerX = size / 2;
  const centerY = size / 2;
  const strokeWidth = size * 0.08;

  // Status mapping with colors from API
  const statusConfig = {
    REOPEN: { label: 'Reopen', color: '#f92309' },
    NEW: { label: 'New', color: '#443eda' },
    OPEN: { label: 'Open', color: '#e4c73e' },
    FIXED: { label: 'Fixed', color: '#57dc1e' },
    CLOSED: { label: 'Closed', color: '#167409' },
    REJECTED: { label: 'Rejected', color: '#800f0f' },
    DUPLICATE: { label: 'Duplicate', color: '#676363' }
  };

  // Prepare chart data
  const chartData = Object.entries(data.statuses || {})
    .filter(([_, statusData]) => statusData.count > 0)
    .map(([status, statusData]) => ({
      status,
      label: statusConfig[status as keyof typeof statusConfig]?.label || status,
      count: statusData.count,
      color: statusData.color || statusConfig[status as keyof typeof statusConfig]?.color || '#666',
      percentage: data.total > 0 ? (statusData.count / data.total) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending

  // Calculate pie slices
  const createPieSlice = (startAngle: number, endAngle: number, color: string) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    return pathData;
  };

  let currentAngle = -90; // Start from top
  const pieSlices = chartData.map((item) => {
    const sliceAngle = (item.percentage / 100) * 360;
    const pathData = createPieSlice(currentAngle, currentAngle + sliceAngle, item.color);
    const slice = {
      ...item,
      pathData,
      startAngle: currentAngle,
      endAngle: currentAngle + sliceAngle
    };
    currentAngle += sliceAngle;
    return slice;
  });

  const getSeverityTitle = () => {
    const titles = {
      high: 'High Severity Defects',
      medium: 'Medium Severity Defects', 
      low: 'Low Severity Defects'
    };
    return titles[severityLevel];
  };

  const getSeverityColor = () => {
    const colors = {
      high: '#dc2626',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[severityLevel];
  };

  if (!data || !data.statuses || data.total === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: getSeverityColor() }]}>
          {getSeverityTitle()}
        </Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: getSeverityColor() }]}>
        {getSeverityTitle()}
      </Text>
      
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          {/* Pie slices */}
          {pieSlices.map((slice, index) => (
            <Path
              key={`slice-${index}`}
              d={slice.pathData}
              fill={slice.color}
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
          

        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {chartData.map((item, index) => (
          <View key={`legend-${index}`} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {item.label}: {item.count} ({item.percentage.toFixed(1)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  legendContainer: {
    width: '100%',
    maxWidth: 280,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  noDataText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});

export default SeverityPieChart;
