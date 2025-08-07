import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {
  Path,
  Circle,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

interface GaugeMeterProps {
  value: number; // Current value to display
  minValue?: number; // Minimum value (default: 0)
  maxValue?: number; // Maximum value (default: 100)
  size?: number; // Size of the gauge (default: 200)
  title?: string; // Title above the gauge
  unit?: string; // Unit to display (e.g., "%", "km/h", etc.)
  ranges?: {
    // Color ranges configuration
    min: number;
    max: number;
    color: string;
    label?: string;
  }[];
  showTicks?: boolean; // Show tick marks (default: true)
  showNumbers?: boolean; // Show numbers (default: true)
  animated?: boolean; // Animate needle movement (default: true)
}

const GaugeMeter: React.FC<GaugeMeterProps> = ({
  value,
  minValue = 0,
  maxValue = 100,
  size = 200,
  title,
  unit = '',
  ranges = [
    {min: 0, max: 30, color: '#22c55e', label: 'Good'}, // Green
    {min: 30, max: 70, color: '#eab308', label: 'Warning'}, // Yellow
    {min: 70, max: 100, color: '#ef4444', label: 'Critical'}, // Red
  ],
  showTicks = true,
  showNumbers = true,
  animated = true,
}) => {
  // Calculate dimensions
  const radius = (size - 40) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const strokeWidth = 20;

  // Gauge configuration
  const startAngle = 0; // 0 degrees (3 o'clock position)
  const endAngle = Math.PI; // 180 degrees (9 o'clock position)
  const totalAngle = Math.PI; // 180 degrees total

  // Clamp value within min/max range
  const clampedValue = Math.min(Math.max(value, minValue), maxValue);

  // Calculate needle angle
  const valueRange = maxValue - minValue;
  const normalizedValue = (clampedValue - minValue) / valueRange;
  const needleAngle = startAngle + normalizedValue * totalAngle;

  // Create arc path for color segments
  const createArcPath = (startVal: number, endVal: number): string => {
    const startNormalized = (startVal - minValue) / valueRange;
    const endNormalized = (endVal - minValue) / valueRange;
    
    const startAngleRad = startAngle + startNormalized * totalAngle;
    const endAngleRad = startAngle + endNormalized * totalAngle;

    const startX = centerX + radius * Math.cos(startAngleRad);
    const startY = centerY + radius * Math.sin(startAngleRad);
    const endX = centerX + radius * Math.cos(endAngleRad);
    const endY = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = endAngleRad - startAngleRad > Math.PI ? 1 : 0;

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  // Generate tick marks
  const generateTicks = () => {
    const ticks = [];
    const tickCount = 11; // 0, 10, 20, ..., 100
    
    for (let i = 0; i < tickCount; i++) {
      const tickValue = minValue + (i / (tickCount - 1)) * valueRange;
      const tickAngle = startAngle + (i / (tickCount - 1)) * totalAngle;
      
      // Major tick (longer)
      const isMajorTick = i % 2 === 0;
      const tickLength = isMajorTick ? 15 : 8;
      const tickWidth = isMajorTick ? 2 : 1;
      
      const innerRadius = radius - strokeWidth / 2 - 5;
      const outerRadius = innerRadius - tickLength;
      
      const x1 = centerX + innerRadius * Math.cos(tickAngle);
      const y1 = centerY + innerRadius * Math.sin(tickAngle);
      const x2 = centerX + outerRadius * Math.cos(tickAngle);
      const y2 = centerY + outerRadius * Math.sin(tickAngle);

      ticks.push(
        <Line
          key={`tick-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#666"
          strokeWidth={tickWidth}
        />
      );

      // Add numbers for major ticks
      if (showNumbers && isMajorTick) {
        const numberRadius = outerRadius - 15;
        const numberX = centerX + numberRadius * Math.cos(tickAngle);
        const numberY = centerY + numberRadius * Math.sin(tickAngle);

        ticks.push(
          <SvgText
            key={`number-${i}`}
            x={numberX}
            y={numberY + 4}
            fontSize={12}
            fill="#666"
            textAnchor="middle"
          >
            {Math.round(tickValue)}
          </SvgText>
        );
      }
    }
    
    return ticks;
  };

  // Calculate needle coordinates
  const needleLength = radius - strokeWidth / 2 - 10;
  const needleX = centerX + needleLength * Math.cos(needleAngle);
  const needleY = centerY + needleLength * Math.sin(needleAngle);

  // Get current range info
  const getCurrentRange = () => {
    return ranges.find(range => clampedValue >= range.min && clampedValue <= range.max) || ranges[0];
  };

  const currentRange = getCurrentRange();

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <Svg width={size} height={size * 0.7} style={styles.svg}>
        <Defs>
          {/* Gradient for needle */}
          <LinearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#333" />
            <Stop offset="100%" stopColor="#666" />
          </LinearGradient>
        </Defs>

        {/* Background arc */}
        <Path
          d={createArcPath(minValue, maxValue)}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Color segments */}
        {ranges.map((range, index) => (
          <Path
            key={`range-${index}`}
            d={createArcPath(range.min, range.max)}
            stroke={range.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        ))}

        {/* Tick marks and numbers */}
        {showTicks && generateTicks()}

        {/* Needle */}
        <Line
          x1={centerX}
          y1={centerY}
          x2={needleX}
          y2={needleY}
          stroke="url(#needleGradient)"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Center circle */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={8}
          fill="#333"
          stroke="#666"
          strokeWidth={2}
        />

        {/* Value display */}
        <SvgText
          x={centerX}
          y={centerY + 40}
          fontSize={24}
          fontWeight="bold"
          fill="#333"
          textAnchor="middle"
        >
          {clampedValue.toFixed(1)}{unit}
        </SvgText>

        {/* Range label */}
        {currentRange.label && (
          <SvgText
            x={centerX}
            y={centerY + 60}
            fontSize={14}
            fill={currentRange.color}
            textAnchor="middle"
            fontWeight="600"
          >
            {currentRange.label}
          </SvgText>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
    textAlign: 'center',
  },
  svg: {
    overflow: 'visible',
  },
});

export default GaugeMeter;
