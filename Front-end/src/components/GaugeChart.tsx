import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';

interface GaugeChartProps {
  value: number;
  title: string;
  size?: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ 
  value, 
  title, 
  size = 200 
}) => {
  const centerX = size * 0.49; // Position for upward speedometer
  const centerY = size * 0.66; // Position for upward speedometer
  const radius = size * 0.49;
  const strokeWidth = size * 0.11;

  // Calculate angles for UPWARD speedometer (needle points UP)
  const startAngle = -Math.PI; // -180 degrees (left side, upward arc)
  const endAngle = 0; // 0 degrees (right side)
  const totalAngle = Math.PI; // 180 degrees total

  // Define ranges
  const ranges = [
    { min: 0, max: 7, color: '#10b981', label: 'Good' }, // Green
    { min: 7, max: 10, color: '#f59e0b', label: 'Moderate' }, // Yellow
    { min: 10, max: 15, color: '#ef4444', label: 'High' } // Red
  ];

  // Create arc paths for each range with gaps between segments
  const createArcPath = (startValue: number, endValue: number, addGap: boolean = true) => {
    const maxValue = 15; // Maximum scale value
    const gapSize = addGap ? 0.02 : 0; // Small gap between segments
    const adjustedStartValue = startValue + (startValue > 0 ? gapSize : 0);
    const adjustedEndValue = endValue - (endValue < maxValue ? gapSize : 0);

    const startAngleRad = startAngle + (adjustedStartValue / maxValue) * totalAngle;
    const endAngleRad = startAngle + (adjustedEndValue / maxValue) * totalAngle;

    const startX = centerX + radius * Math.cos(startAngleRad);
    const startY = centerY + radius * Math.sin(startAngleRad);
    const endX = centerX + radius * Math.cos(endAngleRad);
    const endY = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = Math.abs(endAngleRad - startAngleRad) > Math.PI ? 1 : 0;

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  // Calculate needle angle
  const maxValue = 15;
  const clampedValue = Math.min(Math.max(value, 0), maxValue);
  const needleAngle = startAngle + (clampedValue / maxValue) * totalAngle;
  const needleLength = radius * 0.8;
  const needleX = centerX + needleLength * Math.cos(needleAngle);
  const needleY = centerY + needleLength * Math.sin(needleAngle);

  // Get current range color
  const getCurrentColor = () => {
    for (const range of ranges) {
      if (value >= range.min && value < range.max) {
        return range.color;
      }
    }
    return ranges[ranges.length - 1].color; // Default to red for values >= 10
  };

  // Get current range label
  const getCurrentLabel = () => {
    for (const range of ranges) {
      if (value >= range.min && value < range.max) {
        return range.label;
      }
    }
    return ranges[ranges.length - 1].label; // Default to "High" for values >= 10
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.gaugeContainer}>
        <Svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.8}`}>
          {/* Background arc with cut-off ends */}
          <Path
            d={createArcPath(0, 15, false)}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth * 0.3}
            fill="none"
            strokeLinecap="butt"
          />

          {/* Colored range arcs with gaps and cut-off ends */}
          {ranges.map((range, index) => (
            <Path
              key={index}
              d={createArcPath(range.min, range.max, true)}
              stroke={range.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="butt"
            />
          ))}
          
          {/* Scale labels positioned OUTSIDE the gauge */}
          {/* 0 - Start of green segment (outside) */}
          <SvgText
            x={centerX + (radius + strokeWidth * 0.8) * Math.cos(startAngle)}
            y={centerY + (radius + strokeWidth * 0.8) * Math.sin(startAngle) - 5}
            fontSize={size * 0.08}
            fill="#6b7280"
            textAnchor="middle"
          >
            0
          </SvgText>

          {/* 7 - Start of yellow segment (outside) */}
          <SvgText
            x={centerX + (radius + strokeWidth * 0.8) * Math.cos(startAngle + (7/15) * totalAngle)}
            y={centerY + (radius + strokeWidth * 0.8) * Math.sin(startAngle + (7/15) * totalAngle) - 5}
            fontSize={size * 0.08}
            fill="#6b7280"
            textAnchor="middle"
          >
            7
          </SvgText>

          {/* 10 - Start of red segment (outside) */}
          <SvgText
            x={centerX + (radius + strokeWidth * 0.8) * Math.cos(startAngle + (10/15) * totalAngle)}
            y={centerY + (radius + strokeWidth * 0.8) * Math.sin(startAngle + (10/15) * totalAngle) - 5}
            fontSize={size * 0.08}
            fill="#6b7280"
            textAnchor="middle"
          >
            10
          </SvgText>

          {/* 15 - End of red segment (outside) */}
          <SvgText
            x={centerX + (radius + strokeWidth * 0.8) * Math.cos(startAngle + totalAngle)}
            y={centerY + (radius + strokeWidth * 0.8) * Math.sin(startAngle + totalAngle) - 5}
            fontSize={size * 0.08}
            fill="#6b7280"
            textAnchor="middle"
          >
            15
          </SvgText>
          
          {/* Needle */}
          <Line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke="#374151"
            strokeWidth={3}
            strokeLinecap="round"
          />
          
          {/* Center circle */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={8}
            fill="#374151"
          />
        </Svg>
      </View>
      
      {/* Value display */}
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: getCurrentColor() }]}>
          {value.toFixed(2)}
        </Text>
        <Text style={[styles.label, { color: getCurrentColor() }]}>
          {getCurrentLabel()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default GaugeChart;
