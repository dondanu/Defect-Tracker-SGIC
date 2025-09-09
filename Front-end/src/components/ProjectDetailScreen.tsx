import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Dimensions
} from 'react-native';
import Header from './Header';
import Footer from './Footer';
import { getDefectSeverityIndex } from '../api/dsi';
import { getDefectRemarkRatioByProjectId } from '../api/remarkratio';
import { getReopenCountSummary } from '../api/Defectreopen';
import { getDefectTypeByProjectId } from '../api/defecttype';
import { getDefectsByModule } from '../api/defectbymodule';
import { getDefectDensity } from '../api/defectdensity';
import { getReleasesByProjectId, getTimeToFindDefects, getTimeToFixDefects } from '../api/release';
import { LineChart } from 'react-native-chart-kit';
import GaugeChart from './GaugeChart';
import DynamicPieChart from './DynamicPieChart';
import SeverityPieChart from './SeverityPieChart';

const screenWidth = Dimensions.get('window').width;

// Old remote: 'http://74.235.80.66:8087'
// New local API base
const BASE_URL = (process as any)?.env?.VITE_BASE_URL || 'http://192.168.1.85:3000/api';

interface ProjectDetailScreenProps {
  projectId: number;
  projectName: string;
  onDashboardPress: () => void;
  onProfilePress: () => void;
  onLogoutPress: () => void;
}

const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({
  projectId,
  projectName,
  onDashboardPress,
  onProfilePress,
  onLogoutPress
}) => {
  const [projectDetails, setProjectDetails] = useState<any>(null);
  const [defects, setDefects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [selectedProjectTab, setSelectedProjectTab] = useState(projectId);
  const [defectStats, setDefectStats] = useState({
    high: { recent: 0, expired: 0, open: 0, fixed: 0, duplicate: 0, total: 12 },
    medium: { recent: 0, logical: 0, open: 0, backlog: 0, duplicate: 0, total: 8 },
    low: { recent: 0, logical: 0, open: 0, fixed: 0, duplicate: 0, total: 3 },
    density: 0,
    severityIndex: 43.6,
    remarkRatio: 97.75,
    remarkCategory: 'High',
    remarkColor: 'red'
  });
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);
  const [severitySummary, setSeveritySummary] = useState<any>(null);
  const [reopenCountData, setReopenCountData] = useState<any>(null);
  const [defectTypeData, setDefectTypeData] = useState<any>(null);
  const [defectsByModuleData, setDefectsByModuleData] = useState<any>(null);
  const [defectsByModuleError, setDefectsByModuleError] = useState<boolean>(false);
  const [remarkRatioError, setRemarkRatioError] = useState<boolean>(false);
  const [selectedSeverityChart, setSelectedSeverityChart] = useState<'high' | 'medium' | 'low' | null>(null);
  const [projectRiskLevel, setProjectRiskLevel] = useState<string>('Medium Risk');
  const [projectCardData, setProjectCardData] = useState<{ [projectId: number]: any }>({});
  
  // Release-related state
  const [releases, setReleases] = useState<any[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<string>('all');
  const [timeToFindData, setTimeToFindData] = useState<any>(null);
  const [timeToFixData, setTimeToFixData] = useState<any>(null);
  const [loadingReleaseData, setLoadingReleaseData] = useState(false);
  const [showReleaseDropdown, setShowReleaseDropdown] = useState(false);

  // Keep this useEffect to maintain hook order (but without console logs)
  useEffect(() => {
    // Silently monitor severity summary changes
  }, [severitySummary]);

  // Function to fetch release data
  const fetchReleaseData = async (projectId: number, releaseId?: string) => {
    try {
      setLoadingReleaseData(true);
      const token = await AsyncStorage.getItem('authToken');
      
      // Fetch releases for the project
      const releasesResponse = await getReleasesByProjectId(projectId, token || undefined);
      // The releases might be directly in the response or nested under data
      const releases = releasesResponse.data?.releases || releasesResponse.releases || releasesResponse.data || [];
      
      setReleases(releases);
      
      // Keep "ALL Releases" as default, don't auto-select any specific release
      if (releases.length > 0 && releaseId === 'all') {
        console.log('DEBUG: Keeping ALL Releases as default selection');
        // Don't auto-select, just show empty charts for "ALL Releases"
        setTimeToFindData(null);
        setTimeToFixData(null);
        return;
      }
      
      // If a specific release is selected, fetch its time data
      if (releaseId && releaseId !== 'all') {
        try {
          
          // Find the selected release to get its name and ID
          const selectedReleaseData = releases.find((r: any) => r.id.toString() === releaseId);
          
          
          if (selectedReleaseData) {
            const releaseName = selectedReleaseData.releaseName || selectedReleaseData.name;
            const releaseIdNum = selectedReleaseData.id;
            
            // Fetch time to find defects (uses projectId and releaseName)
            const findData = await getTimeToFindDefects(projectId, releaseName, token || undefined);
            setTimeToFindData(findData);
            
            // Fetch time to fix defects (uses projectId and releaseId)
            const fixData = await getTimeToFixDefects(projectId, releaseIdNum, token || undefined);
            setTimeToFixData(fixData);
          } else {
            setTimeToFindData(null);
            setTimeToFixData(null);
          }
        } catch (error) {
          // Silently handle
          setTimeToFindData(null);
          setTimeToFixData(null);
        }
      } else {
        // For "All Releases", show empty charts
        setTimeToFindData(null);
        setTimeToFixData(null);
      }
    } catch (error) {
      console.error('Error fetching release data:', error);
      // Set empty data on error to prevent UI issues
      setReleases([]);
      setTimeToFindData(null);
      setTimeToFixData(null);
    } finally {
      setLoadingReleaseData(false);
    }
  };

  useEffect(() => {
    // Fetch all projects for the project selection tabs
    const fetchAllProjects = async () => {
      try {
        const projectsUrl = `${BASE_URL}/projects`;
        console.log('API CALL:', projectsUrl);
        const token = await AsyncStorage.getItem('authToken');
        const response = await fetch(projectsUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await response.json();
        const projects = Array.isArray(data?.data?.projects)
          ? data.data.projects
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];
        setAllProjects(projects);

        // Fetch project card colors for all projects
        (projects || []).forEach(async (project: any) => {
          const colorUrl = `${BASE_URL}/dashboard/project-card-color/${project.id}`;
          console.log('API CALL:', colorUrl);
          try {
            const colorRes = await fetch(colorUrl, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const colorData = await colorRes.json();
            if (colorData.data) {
              setProjectCardData(prev => ({
                ...prev,
                [project.id]: colorData.data
              }));
            }
          } catch (err) {
            // Silently handle error
          }
        });
      } catch (error) {
        // Silently handle error
      }
    };

    fetchAllProjects();
  }, []);

  useEffect(() => {
    // Fetch project details and defect statistics, plus all analytics APIs and update state for UI

    const fetchProjectData = async () => {
      setLoading(true);
      setRemarkRatioError(false);
      setDefectsByModuleError(false);
      try {
        // Log all API URLs before calling
        const apiUrls = [
          `${BASE_URL}/defect-statistics/${selectedProjectTab}`,
          `${BASE_URL}/dashboard/defect_severity_summary/${selectedProjectTab}`,
          `${BASE_URL}/dashboard/defect-remark-ratio?projectId=${selectedProjectTab}`,
          `${BASE_URL}/dashboard/dsi/${selectedProjectTab}`,
          `${BASE_URL}/dashboard/defect-type/${selectedProjectTab}`,
          `${BASE_URL}/dashboard/reopen-count_summary/${selectedProjectTab}`,
          `${BASE_URL}/dashboard/defect-density/${selectedProjectTab}`,
          `${BASE_URL}/dashboard/module?projectId=${selectedProjectTab}`
        ];
        apiUrls.forEach(url => console.log('API CALL:', url));

        const token = await AsyncStorage.getItem('authToken');

        // Helper to fetch silently (only API URL is logged elsewhere)
        const fetchWithStatus = async (url: string) => {
          try {
            const res = await fetch(url, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            try {
              return await res.json();
            } catch {
              return null;
            }
          } catch {
            return null;
          }
        };

        // Fetch all APIs in parallel with status/error logging
        const [
          statsData,
          severityData,
          remarkRatioData,
          dsiData,
          defectTypeDataRes,
          reopenData,
          defectDensityData,
          defectsByModuleDataRes
        ] = await Promise.all([
          fetchWithStatus(apiUrls[0]),
          fetchWithStatus(apiUrls[1]),
          fetchWithStatus(apiUrls[2]),
          fetchWithStatus(apiUrls[3]),
          fetchWithStatus(apiUrls[4]),
          fetchWithStatus(apiUrls[5]),
          fetchWithStatus(apiUrls[6]),
          fetchWithStatus(apiUrls[7])
        ]);

        // Suppressed response logs

        // 1. Defect statistics
        if (statsData && statsData.data) {
          setDefectStats((prev) => ({ ...prev, ...statsData.data }));
        }



        // 3. Defect severity summary
        if (severityData && severityData.data && severityData.data.defectSummary) {
          const transformedData = { high: {}, medium: {}, low: {}, totalDefects: severityData.data.totalDefects };

          const normalizeStatuses = (raw: any) => {
            const safe = raw || {};
            const wrap = (val: any) => {
              if (val == null) return { count: 0 };
              if (typeof val === 'number') return { count: val };
              if (typeof val === 'object' && typeof val.count === 'number') return { count: val.count };
              return { count: 0 };
            };
            const pick = (variants: string[]) => {
              for (const k of variants) {
                if (k in safe) return wrap(safe[k]);
              }
              return { count: 0 };
            };
            return {
              REOPEN: pick(['REOPEN', 'reopen', 'Reopen', 're-open', 'reject', 'Reject']),
              NEW: pick(['NEW', 'new', 'New']),
              OPEN: pick(['OPEN', 'open', 'Open']),
              FIXED: pick(['FIXED', 'fixed', 'Fixed', 'CLOSED', 'closed', 'Close']),
              DUPLICATE: pick(['DUPLICATE', 'duplicate', 'Duplicate'])
            };
          };

          severityData.data.defectSummary.forEach((item: any) => {
            const level = item.severity?.toLowerCase();
            if (level === 'high' || level === 'medium' || level === 'low') {
              const obj = { total: item.totalDefects || 0, statuses: normalizeStatuses(item.statuses) };
              (transformedData as any)[level] = obj;
            }
          });
          setSeveritySummary(transformedData);
        } else {
          setSeveritySummary(null);
        }

        // 4. Defect to remark ratio
        if (remarkRatioData && remarkRatioData.data && remarkRatioData.data.ratio) {
          const ratioString = remarkRatioData.data.ratio;
          const ratioNumber = parseFloat(ratioString.replace('%', ''));
          setDefectStats(prev => ({
            ...prev,
            remarkRatio: ratioNumber,
            remarkCategory: remarkRatioData.data.category || 'Medium',
            remarkColor: remarkRatioData.data.color || 'green'
          }));
          setRemarkRatioError(false);
        } else {
          setRemarkRatioError(true);
        }

        // 5. Defect severity index (DSI) - normalize multiple shapes
        if (dsiData && dsiData.data) {
          const raw = (dsiData.data.dsiPercentage ?? dsiData.data.dsi ?? dsiData.data.value ?? dsiData.data);
          let parsed = 0;
          if (typeof raw === 'number') parsed = raw;
          else if (typeof raw === 'string') {
            const n = parseFloat(raw.replace('%', '').trim());
            parsed = isNaN(n) ? 0 : n;
          }
          setDefectStats(prev => ({ ...prev, severityIndex: parsed }));
          if (dsiData.data.interpretation) {
            setProjectRiskLevel(dsiData.data.interpretation);
          } else if (parsed <= 25) {
            setProjectRiskLevel('Low Risk');
          } else if (parsed <= 75) {
            setProjectRiskLevel('Medium Risk');
          } else {
            setProjectRiskLevel('High Risk');
          }
        }

        // 6. Defect density: set to API value when number, otherwise force 0
        if (defectDensityData && defectDensityData.data && typeof defectDensityData.data.defectDensity === 'number') {
          setDefectStats(prev => ({ ...prev, density: defectDensityData.data.defectDensity }));
        } else {
          setDefectStats(prev => ({ ...prev, density: 0 }));
        }

        // 7. Reopen count summary
        if (reopenData && !reopenData.error) {
          if (reopenData.message?.includes("No data found") || (Array.isArray(reopenData.data) && reopenData.data.length === 0)) {
            setReopenCountData("NO_DATA");
          } else if (reopenData.data && Array.isArray(reopenData.data) && reopenData.data.length > 0) {
            setReopenCountData(reopenData.data);
          } else {
            setReopenCountData(null);
          }
        } else {
          setReopenCountData(null);
        }

        // 8. Defect distribution by type
        if (defectTypeDataRes && defectTypeDataRes.data && Array.isArray(defectTypeDataRes.data.defectTypes)) {
          if (defectTypeDataRes.data.defectTypes.length > 0) {
            setDefectTypeData({
              defectTypes: defectTypeDataRes.data.defectTypes,
              totalDefectCount: defectTypeDataRes.data.totalDefectCount,
              mostCommonDefectType: defectTypeDataRes.data.mostCommonDefectType,
              mostCommonDefectCount: defectTypeDataRes.data.mostCommonDefectCount
            });
          } else {
            setDefectTypeData("INVALID_DATA");
          }
        } else {
          setDefectTypeData(null);
        }

        // 9. Defects by module
        if (defectsByModuleDataRes && defectsByModuleDataRes.data && Array.isArray(defectsByModuleDataRes.data)) {
          if (defectsByModuleDataRes.data.length > 0) {
            setDefectsByModuleData(defectsByModuleDataRes.data);
          } else {
            setDefectsByModuleData("NO_DATA");
          }
        } else {
          setDefectsByModuleData(null);
          setDefectsByModuleError(true);
        }

        // 10. Fetch release data
        try {
          await fetchReleaseData(selectedProjectTab, selectedRelease);
        } catch (error) {
          console.error('Error in fetchProjectData when calling fetchReleaseData:', error);
        }

      } catch (error) {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [selectedProjectTab]);

  // Effect to handle release selection changes
  useEffect(() => {
    // API CALL logs only will be printed within fetch functions
    
    if (selectedProjectTab) {
      try {
        fetchReleaseData(selectedProjectTab, selectedRelease);
      } catch (error) {
        console.error('Error in release selection useEffect:', error);
      }
    }
  }, [selectedRelease]);

  // Helper functions for dynamic project info
  const getProjectRiskFromCardAPI = (projectId: number): 'high' | 'medium' | 'low' => {
    const cardData = projectCardData[projectId];

    if (!cardData || !cardData.availableRiskLevels || cardData.availableRiskLevels.length === 0) {
      return 'medium';
    }

    // Get the highest risk level from availableRiskLevels
    const riskLevels = cardData.availableRiskLevels;

    if (riskLevels.includes('High')) {
      return 'high';
    } else if (riskLevels.includes('Medium')) {
      return 'medium';
    } else if (riskLevels.includes('Low')) {
      return 'low';
    } else {
      return 'medium'; // Default fallback
    }
  };

  const getRiskLevel = () => {
    // Get risk from project card API data
    const risk = getProjectRiskFromCardAPI(selectedProjectTab);

    switch (risk) {
      case 'high': return 'High Risk';
      case 'low': return 'Low Risk';
      case 'medium': return 'Medium Risk';
      default: return 'Medium Risk';
    }
  };

  const getRiskColor = () => {
    // Determine color based on project card API risk
    const risk = getProjectRiskFromCardAPI(selectedProjectTab);

    switch (risk) {
      case 'high': return '#dc2626'; // Red for High Risk
      case 'low': return '#10b981'; // Green for Low Risk
      case 'medium': return '#f59e0b'; // Yellow for Medium Risk
      default: return '#f59e0b'; // Default yellow
    }
  };

  const getSelectedProjectName = () => {
    return allProjects.find(p => p.id === selectedProjectTab)?.projectName || 'Project';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header onLogoutPress={onLogoutPress} />
      <ScrollView style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={onDashboardPress}>
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>

        {/* Project Selection Tabs */}
        <View style={styles.projectSelectionContainer}>
          <Text style={styles.projectSelectionTitle}>Project Selection</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.projectTabsContainer}
          >
            {[...allProjects]
              .sort((a: any, b: any) => {
                // Show the currently selected project first
                if (a.id === selectedProjectTab && b.id !== selectedProjectTab) return -1;
                if (b.id === selectedProjectTab && a.id !== selectedProjectTab) return 1;
                // Then order by risk: High -> Medium -> Low
                const priority: { [k in 'high' | 'medium' | 'low']: number } = { high: 0, medium: 1, low: 2 };
                const ra = getProjectRiskFromCardAPI(a.id);
                const rb = getProjectRiskFromCardAPI(b.id);
                return priority[ra] - priority[rb];
              }).map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[
                  styles.projectTab,
                  selectedProjectTab === project.id && styles.selectedProjectTab
                ]}
                onPress={() => setSelectedProjectTab(project.id)}
              >
                <Text style={[
                  styles.projectTabText,
                  selectedProjectTab === project.id && styles.selectedProjectTabText
                ]}>
                  {project.projectName || project.name || `Project ${project.id}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Dynamic Project Header */}
        <View style={styles.defectTrackerHeader}>
          <Text style={styles.defectTrackerTitle}>{getSelectedProjectName()}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getRiskColor() }
          ]}>
            <Text style={styles.statusBadgeText}>{getRiskLevel()}</Text>
          </View>
        </View>

        {/* Defect Severity Summary */}
        <View style={styles.defectSeverityContainer}>
          <Text style={styles.sectionTitle}>Defect Severity</Text>
          <View style={styles.severitySummary}>
            <View style={styles.severityItem}>
              <View style={[styles.severityDot, { backgroundColor: '#dc2626' }]} />
              <Text style={styles.severityText}>High: {severitySummary?.high?.total || 0}</Text>
            </View>
            <View style={styles.severityItem}>
              <View style={[styles.severityDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.severityText}>Medium: {severitySummary?.medium?.total || 0}</Text>
            </View>
            <View style={styles.severityItem}>
              <View style={[styles.severityDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.severityText}>Low: {severitySummary?.low?.total || 0}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.viewChartButton}
            onPress={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
          >
            <Text style={styles.viewChartText}>
              {showDetailedBreakdown ? 'Hide Chart' : 'View Chart'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Detailed Breakdown Table (shown when View Chart is clicked) */}
        {showDetailedBreakdown && (
          <View style={styles.detailedBreakdownContainer}>
            <Text style={styles.sectionTitle}>Defect Severity Breakdown</Text>

            {/* API Integration - Show loading or data */}
            {severitySummary ? (
              <>
                {/* Debug logs moved to useEffect */}

                {/* Top Row: Low (left) and Medium (right) */}
                <View style={styles.topRowContainer}>
                  {/* Low Severity */}
                  <View style={[styles.severityCard, styles.lowSeverityCard, styles.halfWidthCard]}>
                    <Text style={styles.severityCardTitle}>Defects on Low</Text>
                    <Text style={styles.severityCardTotal}>Total: {severitySummary.low?.total || 0}</Text>
                    <View style={styles.severityStats}>
                      <View style={styles.statRow}>
                        <View style={[styles.statDot, { backgroundColor: '#f92309' }]} />
                        <Text style={styles.statText}>REOPEN: {severitySummary.low?.statuses?.REOPEN?.count || 0}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <View style={[styles.statDot, { backgroundColor: '#443eda' }]} />
                        <Text style={styles.statText}>NEW: {severitySummary.low?.statuses?.NEW?.count || 0}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <View style={[styles.statDot, { backgroundColor: '#e4c73e' }]} />
                        <Text style={styles.statText}>OPEN: {severitySummary.low?.statuses?.OPEN?.count || 0}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <View style={[styles.statDot, { backgroundColor: '#57dc1e' }]} />
                        <Text style={styles.statText}>FIXED: {severitySummary.low?.statuses?.FIXED?.count || 0}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <View style={[styles.statDot, { backgroundColor: '#676363' }]} />
                        <Text style={styles.statText}>DUPLICATE: {severitySummary.low?.statuses?.DUPLICATE?.count || 0}</Text>
                      </View>
                    </View>
                <TouchableOpacity
                  style={styles.viewChartButton}
                  onPress={() => setSelectedSeverityChart(selectedSeverityChart === 'low' ? null : 'low')}
                >
                  <Text style={styles.viewChartText}>
                    {selectedSeverityChart === 'low' ? 'Hide Chart' : 'View Chart'}
                  </Text>
                </TouchableOpacity>
              </View>

                  {/* Medium Severity */}
                  <View style={[styles.severityCard, styles.mediumSeverityCard, styles.halfWidthCard]}>
                    <Text style={styles.severityCardTitle}>Defects on Medium</Text>
                    <Text style={styles.severityCardTotal}>Total: {severitySummary.medium?.total || 0}</Text>
                    <View style={styles.severityStats}>
                      <View style={styles.statRow}>
                        <View style={[styles.statDot, { backgroundColor: '#f92309' }]} />
                        <Text style={styles.statText}>REOPEN: {severitySummary.medium?.statuses?.REOPEN?.count || 0}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <View style={[styles.statDot, { backgroundColor: '#443eda' }]} />
                        <Text style={styles.statText}>NEW: {severitySummary.medium?.statuses?.NEW?.count || 0}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <View style={[styles.statDot, { backgroundColor: '#e4c73e' }]} />
                        <Text style={styles.statText}>OPEN: {severitySummary.medium?.statuses?.OPEN?.count || 0}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <View style={[styles.statDot, { backgroundColor: '#57dc1e' }]} />
                        <Text style={styles.statText}>FIXED: {severitySummary.medium?.statuses?.FIXED?.count || 0}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <View style={[styles.statDot, { backgroundColor: '#676363' }]} />
                        <Text style={styles.statText}>DUPLICATE: {severitySummary.medium?.statuses?.DUPLICATE?.count || 0}</Text>
                      </View>
                    </View>
                <TouchableOpacity
                  style={styles.viewChartButton}
                  onPress={() => setSelectedSeverityChart(selectedSeverityChart === 'medium' ? null : 'medium')}
                >
                  <Text style={styles.viewChartText}>
                    {selectedSeverityChart === 'medium' ? 'Hide Chart' : 'View Chart'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

                {/* Bottom Row: High (full width) */}
                <View style={styles.bottomRowContainer}>
                  <View style={[styles.severityCard, styles.highSeverityCard, styles.fullWidthCard]}>
                    <Text style={styles.severityCardTitle}>Defects on High</Text>
                    <Text style={styles.severityCardTotal}>Total: {severitySummary.high?.total || 0}</Text>

                    {/* Two Column Layout for High Defect Stats */}
                    <View style={styles.highDefectStatsContainer}>
                      {/* Left Column */}
                      <View style={styles.highDefectColumn}>
                        <View style={styles.statRow}>
                          <View style={[styles.statDot, { backgroundColor: '#f92309' }]} />
                          <Text style={styles.statText}>REOPEN: {severitySummary.high?.statuses?.REOPEN?.count || 0}</Text>
                        </View>
                        <View style={styles.statRow}>
                          <View style={[styles.statDot, { backgroundColor: '#443eda' }]} />
                          <Text style={styles.statText}>NEW: {severitySummary.high?.statuses?.NEW?.count || 0}</Text>
                        </View>
                        <View style={styles.statRow}>
                          <View style={[styles.statDot, { backgroundColor: '#e4c73e' }]} />
                          <Text style={styles.statText}>OPEN: {severitySummary.high?.statuses?.OPEN?.count || 0}</Text>
                        </View>
                  </View>

                      {/* Right Column */}
                      <View style={styles.highDefectColumn}>
                        <View style={styles.statRow}>
                          <View style={[styles.statDot, { backgroundColor: '#57dc1e' }]} />
                          <Text style={styles.statText}>FIXED: {severitySummary.high?.statuses?.FIXED?.count || 0}</Text>
                        </View>
                        <View style={styles.statRow}>
                          <View style={[styles.statDot, { backgroundColor: '#676363' }]} />
                          <Text style={styles.statText}>DUPLICATE: {severitySummary.high?.statuses?.DUPLICATE?.count || 0}</Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.viewChartButton}
                      onPress={() => setSelectedSeverityChart(selectedSeverityChart === 'high' ? null : 'high')}
                    >
                      <Text style={styles.viewChartText}>
                        {selectedSeverityChart === 'high' ? 'Hide Chart' : 'View Chart'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.severityText}>Loading severity data...</Text>
            )}
          </View>
        )}

        {/* Severity Pie Chart - Show when a severity level is selected */}
        {selectedSeverityChart && severitySummary && severitySummary[selectedSeverityChart] && (
          <View style={styles.severityChartContainer}>
            <SeverityPieChart
              data={severitySummary[selectedSeverityChart]}
              severityLevel={selectedSeverityChart}
              size={220}
            />
          </View>
        )}

        {/* Statistics Cards - Top Row */}
        <View style={styles.statsTopRow}>
          {/* Defect Density */}
          <View style={styles.statCard}>
            <GaugeChart
              value={defectStats.density}
              title="Defect Density"
              size={180}
            />
          </View>

          {/* Defect Severity Index */}
          <View style={styles.statCard}>
            <Text style={styles.statCardTitle}>Defect Severity Index</Text>

            {/* Thermometer */}
            <View style={styles.thermometerContainer}>
              {/* Scale Labels */}
              <View style={styles.thermometerScale}>
                <Text style={styles.scaleLabel}>100</Text>
                <Text style={styles.scaleLabel}>75</Text>
                <Text style={styles.scaleLabel}>50</Text>
                <Text style={styles.scaleLabel}>25</Text>
                <Text style={styles.scaleLabel}>0</Text>
              </View>

              {/* Thermometer Body */}
              <View style={styles.thermometerBody}>
                {/* Background tube */}
                <View style={styles.thermometerTube}>
                  {/* Dynamic fill based on DSI percentage (0-25 green, 26-50 yellow, 51-100 red) */}
                  <View style={[
                    styles.thermometerFill,
                    {
                      height: `${Math.min(Math.max(defectStats.severityIndex, 0), 100)}%`,
                      backgroundColor:
                        defectStats.severityIndex >= 51 ? '#dc2626' : // Red
                        defectStats.severityIndex >= 26 ? '#fbbf24' : // Yellow
                        '#10b981' // Green
                    }
                  ]} />
                </View>

                {/* Thermometer bulb at bottom */}
                <View style={[
                  styles.thermometerBulb,
                  {
                    backgroundColor:
                      defectStats.severityIndex >= 51 ? '#dc2626' : // Red
                      defectStats.severityIndex >= 26 ? '#fbbf24' : // Yellow
                      '#10b981' // Green
                  }
                ]} />
              </View>

              {/* Value Display */}
              <View style={styles.thermometerValue}>
                <Text style={[
                  styles.severityValue,
                  {
                    color:
                      defectStats.severityIndex >= 51 ? '#dc2626' : // Red
                      defectStats.severityIndex >= 26 ? '#fbbf24' : // Yellow
                      '#10b981' // Green
                  }
                ]}>{defectStats.severityIndex}</Text>
              </View>
            </View>

            <Text style={styles.statCardSubtext}>Weighted severity score (higher = more severe defects)</Text>
          </View>
        </View>

        {/* Statistics Cards - Bottom Row */}
        <View style={styles.statsBottomRow}>
          {/* Defect to Remark Ratio */}
          <View style={styles.statCardFullWidth}>
            <Text style={styles.statCardTitle}>Defect to Remark Ratio</Text>
            {remarkRatioError ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>Failed to load defect to remark ratio</Text>
              </View>
            ) : (
              <View style={styles.remarkRatioContainer}>
                <Text style={styles.remarkRatioValue}>{defectStats.remarkRatio}%</Text>
                <Text style={styles.remarkRatioSubtext}>Defect Remark Ratio (%)</Text>
                <View style={[
                  styles.remarkRatioBadge,
                  {
                    backgroundColor:
                      defectStats.remarkColor === 'green' ? '#10b981' :
                      defectStats.remarkColor === 'yellow' ? '#fbbf24' :
                      defectStats.remarkColor === 'blue' ? '#2563eb' :
                      defectStats.remarkColor === 'red' ? '#dc2626' :
                      '#10b981' // Default green
                  }
                ]}>
                  <Text style={styles.remarkRatioBadgeText}>{defectStats.remarkCategory}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Chart Placeholders */}
        <View style={styles.chartsRow}>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Defects Reopened Multiple Times</Text>

            {/* Check if API returned "No data found" */}
            {reopenCountData === "NO_DATA" ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No data available.</Text>
              </View>
            ) : (
              <>
                {/* Dynamic Pie Chart */}
                <View style={styles.pieChartContainer}>
                  <DynamicPieChart
                    data={reopenCountData && Array.isArray(reopenCountData) ?
                      (() => {
                        // Calculate total for percentages
                        const total = reopenCountData.reduce((sum: number, item: any) => sum + (item.count || 0), 0);

                        return reopenCountData.map((item: any, index: number) => {
                          const count = item.count || 0;
                          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
                          return (
                            <View key={index} style={styles.pieChartLegendItem}>
                              <View style={[
                                styles.pieChartLegendDot,
                                { backgroundColor: getColor(index) }
                              ]} />
                              <Text style={styles.pieChartLegendText}>
                                {item.label || `${item.reopenCount || 0} times`}: {count} ({percentage}%)
                              </Text>
                            </View>
                          );
                        });
                      })() : []
                    }
                    size={140}
                    strokeWidth={2}
                  />
                </View>

                {/* Dynamic Legend */}
                <View style={styles.pieChartLegend}>
                  {reopenCountData && Array.isArray(reopenCountData) && reopenCountData.length > 0 ? (
                    // Dynamic legend from API data with matching colors
                    (() => {
                      const getColor = (index: number): string => {
                        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16', '#ec4899', '#6b7280'];
                        return colors[index % colors.length];
                      };

                      // Calculate total for percentages
                      const total = reopenCountData.reduce((sum: number, item: any) => sum + (item.count || 0), 0);

                      return reopenCountData.map((item: any, index: number) => {
                        const count = item.count || 0;
                        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
                        return (
                          <View key={index} style={styles.pieChartLegendItem}>
                            <View style={[
                              styles.pieChartLegendDot,
                              { backgroundColor: getColor(index) }
                            ]} />
                            <Text style={styles.pieChartLegendText}>
                              {item.label || `${item.reopenCount || 0} times`}: {count} ({percentage}%)
                            </Text>
                          </View>
                        );
                      });
                    })()
                  ) : (
                    // Fallback legend
                    <>
                      <View style={styles.pieChartLegendItem}>
                        <View style={[styles.pieChartLegendDot, { backgroundColor: '#3b82f6' }]} />
                        <Text style={styles.pieChartLegendText}>2 times: 8 (88.9%)</Text>
                      </View>
                      <View style={styles.pieChartLegendItem}>
                        <View style={[styles.pieChartLegendDot, { backgroundColor: '#ef4444' }]} />
                        <Text style={styles.pieChartLegendText}>4 times: 1 (11.1%)</Text>
                      </View>
                    </>
                  )}
                </View>
              </>
            )}
          </View>


        </View>

        {/* Defect Distribution by Type - Separate Row */}
        <View style={styles.singleChartRow}>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Defect Distribution by Type</Text>

            {/* Check if API returned "No defects found" or "No data found" */}
            {defectTypeData === "INVALID_DATA" ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>Invalid defect type data</Text>
              </View>
            ) : defectTypeData === "NO_DATA" ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No data available.</Text>
              </View>
            ) : (
              <>
                {/* Dynamic Multi-Color Pie Chart */}
                <View style={styles.multiPieChartContainer}>
                  <DynamicPieChart
                    data={defectTypeData && defectTypeData.defectTypes ? defectTypeData.defectTypes : []}
                    size={140}
                    strokeWidth={2}
                  />
                </View>

                {/* Dynamic Legend */}
                <View style={styles.multiPieChartLegend}>
                  {defectTypeData && defectTypeData.defectTypes && Array.isArray(defectTypeData.defectTypes) && defectTypeData.defectTypes.length > 0 ? (
                    // Dynamic legend from API data with matching colors
                    (() => {
                      const getColor = (index: number): string => {
                        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16', '#ec4899', '#6b7280'];
                        return colors[index % colors.length];
                      };

                      const renderLegendRows = () => {
                        const rows = [];
                        for (let i = 0; i < defectTypeData.defectTypes.length; i += 2) {
                          const rowItems = defectTypeData.defectTypes.slice(i, i + 2);
                          rows.push(
                            <View key={i} style={styles.legendRow}>
                              {rowItems.map((item: any, rowIndex: number) => (
                                <View key={i + rowIndex} style={styles.multiLegendItem}>
                                  <View style={[
                                    styles.multiLegendDot,
                                    { backgroundColor: getColor(i + rowIndex) }
                                  ]} />
                                  <Text style={styles.multiLegendText}>
                                    {item.defectType || 'Unknown'}: {item.defectCount || 0} {item.percentage ? `(${item.percentage.toFixed(1)}%)` : ''}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          );
                        }
                        return rows;
                      };

                      return renderLegendRows();
                    })()
                  ) : (
                    // Default legend
                    <>
                      <View style={styles.legendRow}>
                        <View style={styles.multiLegendItem}>
                          <View style={[styles.multiLegendDot, { backgroundColor: '#3b82f6' }]} />
                          <Text style={styles.multiLegendText}>Functionality: 236 (52.8%)</Text>
                        </View>
                        <View style={styles.multiLegendItem}>
                          <View style={[styles.multiLegendDot, { backgroundColor: '#ef4444' }]} />
                          <Text style={styles.multiLegendText}>Validation: 100 (22.4%)</Text>
                        </View>
                      </View>
                      <View style={styles.legendRow}>
                        <View style={styles.multiLegendItem}>
                          <View style={[styles.multiLegendDot, { backgroundColor: '#10b981' }]} />
                          <Text style={styles.multiLegendText}>UI: 81 (18.1%)</Text>
                        </View>
                        <View style={styles.multiLegendItem}>
                          <View style={[styles.multiLegendDot, { backgroundColor: '#f59e0b' }]} />
                          <Text style={styles.multiLegendText}>Usability: 30 (6.7%)</Text>
                        </View>
                      </View>
                    </>
                  )}
                </View>
              </>
            )}

            {/* Summary Stats - Only show when data is valid */}
            {defectTypeData !== "INVALID_DATA" && (
              <View style={styles.summaryStats}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>
                    {defectTypeData && defectTypeData.totalDefectCount ? defectTypeData.totalDefectCount : 447}
                  </Text>
                  <Text style={styles.summaryLabel}>Total Defects</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>
                    {defectTypeData && defectTypeData.mostCommonDefectCount ? defectTypeData.mostCommonDefectCount : 236}
                  </Text>
                  <Text style={styles.summaryLabel}>
                    Most Common: {defectTypeData && defectTypeData.mostCommonDefectType ? defectTypeData.mostCommonDefectType : 'Functionality'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Additional Charts Section */}
        <View style={styles.additionalChartsSection}>
          {/* Release Filter */}
          <View style={styles.releaseFilterContainer}>
            <Text style={styles.releaseFilterLabel}>Release:</Text>
            <View style={styles.releaseDropdownContainer}>
              <TouchableOpacity
                style={styles.releaseDropdown}
                onPress={() => setShowReleaseDropdown(!showReleaseDropdown)}
              >
                <Text style={styles.releaseDropdownText}>
                  {selectedRelease === 'all' ? 'ALL Releases' : 
                   releases.find(r => r.id.toString() === selectedRelease)?.releaseName || 'ALL Releases'}
                </Text>
                <Text style={styles.releaseDropdownArrow}>▼</Text>
              </TouchableOpacity>
              
              {/* Dropdown Options */}
              {showReleaseDropdown && (
                <View style={styles.releaseDropdownOptions}>
                  <TouchableOpacity
                    style={styles.releaseOption}
                    onPress={() => {
                      setSelectedRelease('all');
                      setShowReleaseDropdown(false);
                    }}
                  >
                    <Text style={styles.releaseOptionText}>ALL Releases</Text>
                  </TouchableOpacity>
                  {releases.map((release) => (
                    <TouchableOpacity
                      key={release.id}
                      style={styles.releaseOption}
                      onPress={() => {
                        setSelectedRelease(release.id.toString());
                        setShowReleaseDropdown(false);
                      }}
                    >
                      <Text style={styles.releaseOptionText}>{release.releaseName}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
          
          {/* Time Charts - Vertical Layout */}
          {/* Time to Find Defects */}
          <View style={styles.timeChartCard}>
            <Text style={styles.timeChartTitle}>Time to Find Defects</Text>
            {loadingReleaseData ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : timeToFindData && timeToFindData.data ? (
              <View style={styles.chartContainer}>
                <LineChart
                  data={{
                    labels: timeToFindData.data.map((day: any) => `Day ${day.dayNumber}`),
                    datasets: [
                      {
                        data: timeToFindData.data.map((day: any) => day.totalDefects),
                        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue
                        strokeWidth: 3,
                      }
                    ]
                  }}
                  width={screenWidth - 80} // Adjust width for card padding
                  height={180}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: '#3b82f6',
                      fill: '#ffffff',
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '',
                      stroke: '#e5e7eb',
                      strokeWidth: 1,
                    },
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
                <Text style={styles.chartLabel}>Defects Count</Text>
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No time to find data available for selected release</Text>
              </View>
            )}
          </View>

          {/* Time to Fix Defects */}
          <View style={styles.timeChartCard}>
            <Text style={styles.timeChartTitle}>Time to Fix Defects</Text>
            {loadingReleaseData ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : timeToFixData && timeToFixData.dailyData ? (
              <View style={styles.chartContainer}>
                <LineChart
                  data={{
                    labels: timeToFixData.dailyData.map((day: any) => `Day ${day.dayNumber}`),
                    datasets: [
                      {
                        data: timeToFixData.dailyData.map((day: any) => day.defectFixedCount),
                        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green
                        strokeWidth: 3,
                      }
                    ]
                  }}
                  width={screenWidth - 80} // Adjust width for card padding
                  height={180}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: '#10b981',
                      fill: '#ffffff',
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '',
                      stroke: '#e5e7eb',
                      strokeWidth: 1,
                    },
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
                <Text style={styles.chartLabel}>Defects Fixed</Text>
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No time to fix data available for selected release</Text>
              </View>
            )}
          </View>

          {/* Defects by Module Chart */}
          <View style={styles.moduleChartContainer}>
            <Text style={styles.moduleChartTitle}>Defects by Module</Text>

            {/* Check for errors or no data */}
            {defectsByModuleError ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>Failed to load defects by module</Text>
              </View>
            ) : defectsByModuleData === "NO_DATA" ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No data available.</Text>
              </View>
            ) : (
              <View style={styles.moduleChartContent}>
                {/* Dynamic Pie Chart */}
                <View style={styles.pieChartContainer}>
                  <DynamicPieChart
                    data={defectsByModuleData && Array.isArray(defectsByModuleData) ?
                      (() => {
                        // Calculate total for percentages
                        const total = defectsByModuleData.reduce((sum, item) => sum + (item.value || item.defectCount || item.count || 0), 0);

                        return defectsByModuleData.map(item => ({
                          defectType: item.name || item.moduleName || item.module || 'Unknown Module',
                          defectCount: item.value || item.defectCount || item.count || 0,
                          percentage: total > 0 ? (((item.value || item.defectCount || item.count || 0) / total) * 100) : 0
                        }));
                      })() : []
                    }
                    size={140}
                    strokeWidth={2}
                  />
                </View>

                {/* Dynamic Legend */}
                <View style={styles.legendContainer}>
                  {defectsByModuleData && Array.isArray(defectsByModuleData) && defectsByModuleData.length > 0 ? (
                    (() => {
                      const getColor = (index: number): string => {
                        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16', '#ec4899', '#6b7280'];
                        return colors[index % colors.length];
                      };

                      // Calculate total for percentages
                      const total = defectsByModuleData.reduce((sum: number, item: any) => sum + (item.value || item.defectCount || item.count || 0), 0);

                      return defectsByModuleData.map((item: any, index: number) => {
                        const count = item.value || item.defectCount || item.count || 0;
                        const percentage = total > 0 ? ((count / total) * 100).toFixed(2) : '0.00';
                        const moduleName = item.name || item.moduleName || item.module || 'Unknown Module';

                        return (
                          <View key={index} style={styles.legendItem}>
                            <View style={[
                              styles.legendDot,
                              { backgroundColor: getColor(index) }
                            ]} />
                            <Text style={styles.legendText}>{moduleName}</Text>
                            <Text style={styles.legendValue}>{count} ({percentage}%)</Text>
                          </View>
                        );
                      });
                    })()
                  ) : (
                    // Fallback legend when no API data
                    <>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#4285f4' }]} />
                        <Text style={styles.legendText}>Configurations</Text>
                        <Text style={styles.legendValue}>77 (17.30%)</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#34a853' }]} />
                        <Text style={styles.legendText}>Project Management</Text>
                        <Text style={styles.legendValue}>50 (11.24%)</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#fbbc04' }]} />
                        <Text style={styles.legendText}>Bench</Text>
                        <Text style={styles.legendValue}>56 (12.58%)</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
      <Footer
        activeTab="dashboard"
        onDashboardPress={onDashboardPress}
        onProjectsPress={() => {
          // TODO: Navigate to Projects screen
        }}
        onAnalyticsPress={() => {
          // TODO: Navigate to Analytics screen
        }}
        onProfilePress={onProfilePress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  backButton: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignSelf: 'flex-start',
    elevation: 2,
  },
  backButtonText: { fontSize: 16, color: '#3b82f6', fontWeight: '600' },

  // Project Selection
  projectSelectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  projectSelectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 12 },
  projectTabsContainer: { flexDirection: 'row' },
  projectTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedProjectTab: { backgroundColor: '#3b82f6' },
  projectTabText: { fontSize: 14, color: '#666', fontWeight: '500' },
  selectedProjectTabText: { color: '#fff' },

  // Defect Tracker Header
  defectTrackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  defectTrackerTitle: { fontSize: 24, fontWeight: 'bold', color: '#222' },
  statusBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  // Section Title
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 16 },

  // Defect Severity Summary
  defectSeverityContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  severitySummary: {
    marginBottom: 16,
  },
  severityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  severityText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },

  // Detailed Breakdown Container
  detailedBreakdownContainer: {
    marginBottom: 24,
  },

  // Layout Containers
  topRowContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8, // Equal spacing between cards
  },
  bottomRowContainer: {
    marginBottom: 24,
  },

  // Severity Cards
  severityCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  severityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    borderWidth: 2,
  },
  halfWidthCard: {
    flex: 1, // Equal flex distribution
  },
  fullWidthCard: {
    width: '100%',
  },
  highSeverityCard: { borderColor: '#dc2626' },
  mediumSeverityCard: { borderColor: '#f59e0b' },
  lowSeverityCard: { borderColor: '#10b981' },
  severityCardTitle: { fontSize: 14, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  severityCardTotal: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 12 },
  severityStats: { marginBottom: 12 },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statText: { fontSize: 11, color: '#666', flex: 1 },

  // High Defect Two-Column Layout
  highDefectStatsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16, // Space between left and right columns
  },
  highDefectColumn: {
    flex: 1, // Equal width for both columns
  },
  viewChartButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewChartText: { fontSize: 12, color: '#3b82f6', fontWeight: '600' },

  // Severity Chart Container
  severityChartContainer: {
    marginVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 8,
  },

  // Stats Rows
  statsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  statsBottomRow: {
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    alignItems: 'center',
  },
  statCardFullWidth: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    alignItems: 'center',
    width: '100%',
  },
  statCardTitle: { fontSize: 14, fontWeight: 'bold', color: '#222', marginBottom: 8, textAlign: 'center' },
  statCardValue: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6', marginBottom: 8 },
  statCardSubtext: { fontSize: 11, color: '#666', textAlign: 'center', marginTop: 8 },

  // Defect Density Gauge
  defectDensityContainer: {
    alignItems: 'center',
  },
  defectDensityLabel: {
    fontSize: 14,
    color: '#222',
    marginBottom: 16,
    textAlign: 'center',
  },
  defectDensityValue: {
    fontWeight: 'bold',
    color: '#dc2626',
  },

  // Full Semicircular Gauge with 3 colors
  fullSemicircularGauge: {
    position: 'relative',
    width: 120,
    height: 80,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  gaugeCircle: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  // Green section (0-7) - approximately 35% of semicircle
  greenSection: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 33,
    height: 100,
    backgroundColor: '#10b981', // Green
  },
  // Yellow section (7-13) - approximately 30% of semicircle
  yellowSection: {
    position: 'absolute',
    left: 33,
    top: 0,
    width: 34,
    height: 100,
    backgroundColor: '#f59e0b', // Yellow
  },
  // Red section (13-20) - approximately 35% of semicircle
  redSection: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 33,
    height: 100,
    backgroundColor: '#dc2626', // Red
  },
  // Inner white circle creates the gauge thickness
  innerWhiteCircle: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
  },
  // Hide bottom half to create semicircle
  bottomHide: {
    position: 'absolute',
    bottom: -1,
    left: -1,
    width: 102,
    height: 52,
    backgroundColor: '#fff',
  },
  // Needle assembly
  needleAssembly: {
    position: 'absolute',
    bottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  needleArm: {
    width: 2,
    height: 40, // Length to reach the colored arc (gauge radius 50 - inner radius 40 = 10px thick arc)
    backgroundColor: '#333',
    borderRadius: 1,
    transform: [{ rotate: '25deg' }], // Point to 10.12 (in yellow zone)
    transformOrigin: 'bottom center',
  },
  needlePivot: {
    position: 'absolute',
    bottom: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  // Scale labels
  gaugeScale: {
    position: 'absolute',
    bottom: 8,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  leftScale: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  rightScale: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // Remark Ratio
  remarkRatioContainer: { alignItems: 'center' },
  remarkRatioValue: { fontSize: 28, fontWeight: 'bold', color: '#222' },
  remarkRatioSubtext: { fontSize: 11, color: '#666', marginVertical: 4 },
  remarkRatioBadge: {
    // backgroundColor is now set dynamically via inline styles
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  remarkRatioBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  // New Remark Ratio Styles
  remarkRatioLargeValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 8,
  },
  remarkRatioSubtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  remarkRatioStatusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    alignSelf: 'center',
  },
  remarkRatioStatusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  remarkRatioProgressContainer: {
    marginTop: 8,
  },
  remarkRatioProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  remarkRatioProgressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  remarkRatioScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  remarkRatioScaleLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },

  // Charts
  chartsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  singleChartRow: {
    marginBottom: 24,
  },
  chartCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    elevation: 2,
  },
  chartTitle: { fontSize: 14, fontWeight: 'bold', color: '#222', marginBottom: 12, textAlign: 'center' },
  chartPlaceholder: {
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: { fontSize: 12, color: '#666' },

  // Additional Charts Section
  additionalChartsSection: {
    marginBottom: 24,
  },

  // Release Filter
  releaseFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  releaseFilterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 12,
  },
  releaseDropdownContainer: {
    flex: 1,
  },
  releaseDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
  },
  releaseDropdownText: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  releaseDropdownArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  releaseDropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 4,
    zIndex: 1000,
    marginTop: 4,
  },
  releaseOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  releaseOptionText: {
    fontSize: 14,
    color: '#222',
  },

  // Time Charts
  timeChartsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  timeChartCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  timeChartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  lineChartContainer: {
    flexDirection: 'row',
    height: 120,
    marginBottom: 8,
  },
  yAxisLabels: {
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginRight: 8,
    width: 20,
  },
  axisLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  lineChartArea: {
    flex: 1,
  },
  lineChartPlaceholder: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  lineChartText: {
    fontSize: 12,
    color: '#666',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  xAxisLabel: {
    fontSize: 9,
    color: '#666',
    transform: [{ rotate: '-45deg' }],
  },
  chartAxisTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },

  // Loading and No Data States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
  },
  noDataText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  noDataSubtext: {
    fontSize: 10,
    color: '#aaa',
    textAlign: 'center',
    paddingHorizontal: 16,
    fontStyle: 'italic',
  },

  // Chart Styles
  chartCanvas: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    height: 100,
  },
  chartBar: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 30,
    height: 100,
    position: 'relative',
  },
  barFill: {
    width: 20,
    borderRadius: 2,
    position: 'absolute',
    bottom: 0,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  
  // Line Chart Styles
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },

  // Module Chart (Pie Chart with Legend)
  moduleChartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  moduleChartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
    textAlign: 'center',
  },
  moduleChartContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pieChartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pieChartText: {
    fontSize: 14,
    color: '#666',
  },
  legendContainer: {
    flex: 1,
    paddingLeft: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 12,
    color: '#222',
  },
  legendValue: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // Thermometer Styles
  thermometerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginVertical: 16,
    height: 120,
  },
  thermometerScale: {
    justifyContent: 'space-between',
    height: 100,
    marginRight: 8,
    marginBottom: 20, // Move scale labels up to align with thermometer tube
    paddingVertical: 2, // Add small padding for precise alignment
  },
  scaleLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
  },
  thermometerBody: {
    alignItems: 'center',
    height: 120,
    justifyContent: 'flex-end',
  },
  thermometerTube: {
    width: 12,
    height: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end', // Ensure fill starts from bottom
  },
  thermometerFill: {
    width: '100%',
    // height is now set dynamically via inline styles
    backgroundColor: '#fbbf24', // Yellow color
    borderRadius: 6,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  thermometerBulb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fbbf24', // Yellow color matching the fill
    marginTop: -2,
  },
  thermometerValue: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f59e0b', // Yellow color
  },

  // Pie Chart Styles
  exactPieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    backgroundColor: '#3b82f6', // Blue background (80%)
    overflow: 'hidden',
  },
  blueSection80: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3b82f6', // Blue (80%)
    position: 'absolute',
  },
  yellowSection20: {
    position: 'absolute',
    width: 0,
    height: 0,
    top: 60, // Center of circle
    left: 60, // Center of circle
    borderLeftWidth: 60,
    borderRightWidth: 60,
    borderTopWidth: 60,
    borderBottomWidth: 0,
    borderLeftColor: 'transparent',
    borderRightColor: '#fbbf24', // Yellow slice (20%)
    borderTopColor: '#fbbf24', // Yellow slice (20%)
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-54deg' }], // 20% of 360° = 72°, positioned correctly
    transformOrigin: '0 0',
  },
  pieChartLegend: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  pieChartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  pieChartLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  pieChartLegendText: {
    fontSize: 11,
    color: '#666',
  },



  // Dynamic Pie Chart Styles
  dynamicPieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    backgroundColor: '#3b82f6', // Default blue background
    overflow: 'hidden',
  },
  pieChartSegment: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  yellowSegmentDynamic: {
    position: 'absolute',
    width: 0,
    height: 0,
    top: 60,
    left: 60,
    borderLeftWidth: 60,
    borderRightWidth: 60,
    borderTopWidth: 60,
    borderBottomWidth: 0,
    borderLeftColor: 'transparent',
    borderRightColor: '#fbbf24',
    borderTopColor: '#fbbf24',
    borderBottomColor: 'transparent',
    transformOrigin: '0 0',
  },

  // Multi-Color Pie Chart Styles
  multiPieChartContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  fourColorPieChart: {
    width: 140,
    height: 140,
    borderRadius: 70,
    position: 'relative',
    overflow: 'hidden',
  },
  // Functionality: 236 (52.8%) - Blue - More than half circle
  functionalityPie: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#3b82f6',
    transform: [{ rotate: '0deg' }],
  },
  // Validation: 100 (22.4%) - Red - Quarter section
  validationPie: {
    position: 'absolute',
    width: 0,
    height: 0,
    top: 70,
    left: 70,
    borderLeftWidth: 0,
    borderRightWidth: 70,
    borderTopWidth: 70,
    borderBottomWidth: 0,
    borderLeftColor: 'transparent',
    borderRightColor: '#ef4444',
    borderTopColor: '#ef4444',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '10deg' }],
    transformOrigin: '0 0',
  },
  // UI: 81 (18.1%) - Green - Smaller section
  uiPie: {
    position: 'absolute',
    width: 0,
    height: 0,
    top: 70,
    left: 70,
    borderLeftWidth: 0,
    borderRightWidth: 70,
    borderTopWidth: 0,
    borderBottomWidth: 70,
    borderLeftColor: 'transparent',
    borderRightColor: '#10b981',
    borderTopColor: 'transparent',
    borderBottomColor: '#10b981',
    transform: [{ rotate: '0deg' }],
    transformOrigin: '0 0',
  },
  // Usability: 30 (6.7%) - Yellow - Smallest section
  usabilityPie: {
    position: 'absolute',
    width: 0,
    height: 0,
    top: 70,
    left: 70,
    borderLeftWidth: 70,
    borderRightWidth: 0,
    borderTopWidth: 70,
    borderBottomWidth: 0,
    borderLeftColor: '#f59e0b',
    borderRightColor: 'transparent',
    borderTopColor: '#f59e0b',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '0deg' }],
    transformOrigin: '0 0',
  },
  multiPieChartLegend: {
    marginTop: 15,
    paddingHorizontal: 10,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  multiLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  multiLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  multiLegendText: {
    fontSize: 11,
    color: '#666',
    flex: 1,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default ProjectDetailScreen;
