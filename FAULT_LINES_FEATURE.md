# Fault Lines Two-Layer System

## 🎉 What Changed

The fault line visualization has been split into **two separate layers** to reduce clutter and give users more control:

### 1. **Major Fault Lines** (High-Risk)
- **Color**: Red (`#ef4444`)
- **Style**: Solid, 3px width, 90% opacity, dashed (2,2)
- **Risk Level**: High
- **Default**: **Enabled by default** ✅
- **Count**: ~8-15 major faults in the Philippines
- **Examples**: 
  - Philippine Fault Zone
  - Marikina Valley Fault (East & West)
  - Manila Trench
  - Cotabato Fault
  - Surigao Fault

### 2. **Minor Fault Lines** (Moderate/Low Risk)
- **Colors**: 
  - Orange (`#f97316`) for Moderate risk
  - Yellow (`#eab308`) for Low risk
- **Style**: Lighter, 2px width, 60% opacity, dashed (3,3)
- **Risk Levels**: Moderate & Low
- **Default**: **Disabled by default** ⚪
- **Count**: ~150+ minor faults

## 📊 Benefits

1. **Reduced Clutter**: By default, only major high-risk faults are shown
2. **User Control**: Users can toggle minor faults on/off as needed
3. **Better Visibility**: Major faults stand out more clearly
4. **Performance**: Faster rendering with fewer lines by default
5. **Educational**: Clear distinction between critical vs. secondary faults

## 🎨 Visual Differences

| Layer | Width | Opacity | Dash Pattern | Color |
|-------|-------|---------|--------------|-------|
| Major Faults | 3px | 90% | `[2, 2]` | Red |
| Minor Faults (Moderate) | 2px | 60% | `[3, 3]` | Orange |
| Minor Faults (Low) | 2px | 60% | `[3, 3]` | Yellow |

## 🎛️ User Interface Changes

### Filter Panel
Before:
```
⚠️ Fault Lines [Toggle]
```

After:
```
⚠️ Major Fault Lines [Toggle] ✅ (ON by default)
Minor Fault Lines [Toggle] ⚪ (OFF by default)
```

### Legend
Now shows three distinct fault line types:
- **Major (High Risk)**: Thick red dashed line
- **Minor (Moderate)**: Thinner orange dashed line  
- **Minor (Low)**: Thinner yellow dashed line

## 🔧 Technical Implementation

### Files Modified

1. **`types/hazard.ts`**
   - Changed: `showFaultLines: boolean` 
   - To: `showMajorFaults: boolean` + `showMinorFaults: boolean`

2. **`app/page.tsx`**
   - Default filter state updated:
     - `showMajorFaults: true` (enabled by default)
     - `showMinorFaults: false` (disabled by default)

3. **`components/layout/filter-panel.tsx`**
   - Added two separate toggles
   - Updated reset filters to restore defaults

4. **`components/map/map-container.tsx`**
   - Split into two layers:
     - `majorFaultLineLayer` (id: `major-fault-lines`)
     - `minorFaultLineLayer` (id: `minor-fault-lines`)
   - Filters fault lines by risk level:
     - Major: `fault.riskLevel === 'high'`
     - Minor: `fault.riskLevel === 'moderate' || fault.riskLevel === 'low'`
   - Updated interactive layer IDs to include both layers
   - Both layers support hover tooltips

5. **`components/map/legend.tsx`**
   - Updated to show three fault line types
   - Added descriptive labels (Major/Minor)

### Data Flow

```
GEM Fault Data (162 faults)
    ↓
loadPhilippineFaultLines()
    ↓
Filter by risk level
    ↓
├─> Major Faults (high risk) → majorFaultLineLayer
└─> Minor Faults (moderate/low) → minorFaultLineLayer
```

### Layer Rendering Logic

```typescript
// Major faults (only high-risk)
const majorFaultLines = faultLines.filter(fault => fault.riskLevel === 'high')

// Minor faults (moderate or low-risk)
const minorFaultLines = faultLines.filter(fault => 
  fault.riskLevel === 'moderate' || fault.riskLevel === 'low'
)

// Render conditionally based on filter state
{filters.showMajorFaults && <MajorFaultLayer />}
{filters.showMinorFaults && <MinorFaultLayer />}
```

## 📈 Statistics

- **Total Faults**: 162 from GEM Global Active Faults Database
- **Major Faults (High Risk)**: ~8-15 faults
- **Minor Faults (Moderate/Low)**: ~147-154 faults
- **Default View**: Only major faults visible
- **Performance Impact**: Minimal (layers render on-demand)

## 🎯 User Experience

### Default Experience (New User)
1. Opens map
2. Sees **only major fault lines** (8-15 high-risk faults)
3. Map is clean and focused on critical hazards
4. Can toggle "Minor Fault Lines" to see all 162 faults

### Advanced Experience
1. Toggles both layers on
2. Sees complete fault network
3. Major faults still stand out (thicker, more opaque)
4. Can easily identify the most dangerous faults

## 🔍 Interactive Features

Both layers support:
- ✅ Hover tooltips showing fault name, risk level, and description
- ✅ Click interactions (if implemented)
- ✅ Responsive to zoom level
- ✅ Smooth rendering and transitions

## 📝 Reset Behavior

When "Reset Filters" is clicked:
- **Major Fault Lines**: ✅ Enabled
- **Minor Fault Lines**: ⚪ Disabled
- Returns to the clean, focused default view

## 🌍 Real-World Impact

This two-layer system helps users:
1. **Quickly identify critical hazards** (major faults always visible)
2. **Avoid information overload** (minor faults hidden by default)
3. **Explore detailed geology** (can enable minor faults when needed)
4. **Better emergency planning** (focus on high-risk areas first)

---

**Last Updated**: October 12, 2025  
**Feature**: Two-Layer Fault Line System  
**Status**: ✅ Implemented and Tested
