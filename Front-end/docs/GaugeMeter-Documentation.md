# Gauge Meter Component Documentation

## Overview
A highly customizable, dynamic gauge meter component for React Native that displays values in a semi-circular speedometer style with color-coded ranges, tick marks, and animated needle movement.

## Features
- ✅ **Semi-circular arc** with customizable size
- ✅ **Dynamic needle/pointer** that responds to data changes
- ✅ **Color segments** (green, yellow, red) for different value ranges
- ✅ **Tick marks and numbers** along the arc
- ✅ **Real-time updates** from backend data
- ✅ **Smooth animations** (optional)
- ✅ **Fully customizable** ranges, colors, and labels
- ✅ **TypeScript support**

## Component Structure

### Core Elements

#### 1. Semi-Circular Arc
```typescript
// Background arc (gray)
<Path
  d={createArcPath(minValue, maxValue)}
  stroke="#e5e7eb"
  strokeWidth={strokeWidth}
  fill="none"
  strokeLinecap="round"
/>

// Color segments overlay
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
```

#### 2. Dynamic Needle/Pointer
```typescript
// Calculate needle position based on value
const needleAngle = startAngle + normalizedValue * totalAngle;
const needleX = centerX + needleLength * Math.cos(needleAngle);
const needleY = centerY + needleLength * Math.sin(needleAngle);

// Render needle
<Line
  x1={centerX}
  y1={centerY}
  x2={needleX}
  y2={needleY}
  stroke="url(#needleGradient)"
  strokeWidth={3}
  strokeLinecap="round"
/>
```

#### 3. Color Segments Configuration
```typescript
ranges={[
  {min: 0, max: 30, color: '#22c55e', label: 'Good'},     // Green
  {min: 30, max: 70, color: '#eab308', label: 'Warning'}, // Yellow
  {min: 70, max: 100, color: '#ef4444', label: 'Critical'} // Red
]}
```

#### 4. Tick Marks and Numbers
```typescript
// Generate tick marks
const generateTicks = () => {
  const ticks = [];
  const tickCount = 11; // 0, 10, 20, ..., 100
  
  for (let i = 0; i < tickCount; i++) {
    const tickValue = minValue + (i / (tickCount - 1)) * valueRange;
    const tickAngle = startAngle + (i / (tickCount - 1)) * totalAngle;
    
    // Major vs minor ticks
    const isMajorTick = i % 2 === 0;
    const tickLength = isMajorTick ? 15 : 8;
    
    // Render tick line and number
  }
};
```

## Props Interface

```typescript
interface GaugeMeterProps {
  value: number;              // Current value to display
  minValue?: number;          // Minimum value (default: 0)
  maxValue?: number;          // Maximum value (default: 100)
  size?: number;              // Size of the gauge (default: 200)
  title?: string;             // Title above the gauge
  unit?: string;              // Unit to display (e.g., "%", "km/h")
  ranges?: {                  // Color ranges configuration
    min: number;
    max: number;
    color: string;
    label?: string;
  }[];
  showTicks?: boolean;        // Show tick marks (default: true)
  showNumbers?: boolean;      // Show numbers (default: true)
  animated?: boolean;         // Animate needle movement (default: true)
}
```

## Usage Examples

### Basic Usage
```typescript
import GaugeMeter from './components/GaugeMeter';

<GaugeMeter
  value={75}
  title="CPU Usage"
  unit="%"
/>
```

### Advanced Configuration
```typescript
<GaugeMeter
  value={defectDensity}
  minValue={0}
  maxValue={15}
  size={220}
  title="Defect Density"
  unit=""
  ranges={[
    {min: 0, max: 7, color: '#22c55e', label: 'Good'},
    {min: 7, max: 10, color: '#eab308', label: 'Moderate'},
    {min: 10, max: 15, color: '#ef4444', label: 'High'},
  ]}
  showTicks={true}
  showNumbers={true}
  animated={true}
/>
```

### Dynamic Data Integration
```typescript
const [apiData, setApiData] = useState(0);

useEffect(() => {
  // Fetch data from API
  fetchDefectDensity()
    .then(response => {
      setApiData(response.data.defectDensity);
    });
}, []);

<GaugeMeter
  value={apiData}  // Dynamic value from backend
  // ... other props
/>
```

## Customization Options

### Color Schemes
```typescript
// Traffic Light Style
ranges={[
  {min: 0, max: 33, color: '#22c55e', label: 'Good'},
  {min: 33, max: 66, color: '#eab308', label: 'Warning'},
  {min: 66, max: 100, color: '#ef4444', label: 'Critical'},
]}

// Temperature Style
ranges={[
  {min: 0, max: 60, color: '#3b82f6', label: 'Cool'},
  {min: 60, max: 85, color: '#22c55e', label: 'Normal'},
  {min: 85, max: 100, color: '#eab308', label: 'Warm'},
  {min: 100, max: 120, color: '#ef4444', label: 'Hot'},
]}
```

### Size Variations
```typescript
// Small gauge
<GaugeMeter value={50} size={150} />

// Medium gauge
<GaugeMeter value={50} size={200} />

// Large gauge
<GaugeMeter value={50} size={300} />
```

## Mathematical Calculations

### Angle Calculations
```typescript
// Semi-circle: 0° to 180° (right to left)
const startAngle = 0;           // 0 degrees (3 o'clock)
const endAngle = Math.PI;       // 180 degrees (9 o'clock)
const totalAngle = Math.PI;     // 180 degrees total

// Normalize value to 0-1 range
const normalizedValue = (clampedValue - minValue) / (maxValue - minValue);

// Calculate needle angle
const needleAngle = startAngle + normalizedValue * totalAngle;
```

### Arc Path Generation
```typescript
const createArcPath = (startVal: number, endVal: number): string => {
  const startNormalized = (startVal - minValue) / valueRange;
  const endNormalized = (endVal - minValue) / valueRange;
  
  const startAngleRad = startAngle + startNormalized * totalAngle;
  const endAngleRad = startAngle + endNormalized * totalAngle;

  const startX = centerX + radius * Math.cos(startAngleRad);
  const startY = centerY + radius * Math.sin(startAngleRad);
  const endX = centerX + radius * Math.cos(endAngleRad);
  const endY = centerY + radius * Math.sin(endAngleRad);

  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
};
```

## Integration with Backend APIs

### Real-time Updates
```typescript
const [gaugeValue, setGaugeValue] = useState(0);

// Polling approach
useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const response = await fetch('your-api-endpoint');
      const data = await response.json();
      setGaugeValue(data.value);
    } catch (error) {
      console.error('API Error:', error);
    }
  }, 5000); // Update every 5 seconds

  return () => clearInterval(interval);
}, []);

// WebSocket approach
useEffect(() => {
  const ws = new WebSocket('ws://your-websocket-endpoint');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setGaugeValue(data.value);
  };

  return () => ws.close();
}, []);
```

## Performance Considerations

1. **Memoization**: Use `React.memo` for static gauges
2. **Animation**: Disable animations for better performance if needed
3. **Update Frequency**: Limit API calls to reasonable intervals
4. **SVG Optimization**: Component uses optimized SVG paths

## Browser/Platform Support

- ✅ React Native (iOS/Android)
- ✅ React Native Web
- ✅ Expo
- ✅ TypeScript support
- ✅ All modern devices and screen sizes
