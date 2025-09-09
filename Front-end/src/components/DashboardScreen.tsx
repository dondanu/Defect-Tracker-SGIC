    import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, SafeAreaView, ActivityIndicator, RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from './Header';
import Footer from './Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDefectRemarkRatioByProjectId } from '../api/remarkratio';
import { getDefectSeverityIndex } from '../api/dsi';
import { getDefectTypeByProjectId } from '../api/defecttype';
import { getReopenCountSummary } from '../api/Defectreopen';
import { getDefectDensity } from '../api/defectdensity';
import { getDefectsByModule } from '../api/defectbymodule';
import { getDefectSeveritySummary } from '../api/dash_get';


// Old: const BASE_URL = 'http://74.235.80.66:8087' (remote)
// Old: const BASE_URL = 'http://192.168.1.85:3000' (no /api)
// New local API base (with /api)
const BASE_URL = 'http://192.168.1.85:3000/api';

const screenWidth = Dimensions.get('window').width;

// Types
type Project = {
  id: number;
  name?: string;
  projectName?: string;
};
type Defect = {
  projectId: number;
  defectStatusName: string;
  // ...other fields as needed
};

interface DashboardScreenProps {
  onProfilePress?: () => void;
  onLogoutPress?: () => void;
  onProjectPress?: (projectId: number, projectName: string) => void;
}

// Helper for risk color - MOVED OUTSIDE COMPONENT TO PREVENT INFINITE RENDERS
const getRiskColor = (risk: 'high' | 'medium' | 'low') => {
  switch (risk) {
    case 'high': return '#ce1111';
    case 'medium': return '#eed61c';
    case 'low': return '#06ba0b';
    default: return '#ccc';
  }
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onProfilePress,
  onLogoutPress,
  onProjectPress
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [cardColors, setCardColors] = useState<{ [projectId: number]: string }>({});
  const [loadingColors, setLoadingColors] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New dashboard API data states
  const [remarkRatio, setRemarkRatio] = useState<any>(null);
  const [severityIndex, setSeverityIndex] = useState<any>(null);
  const [defectTypes, setDefectTypes] = useState<any>(null);
  const [reopenSummary, setReopenSummary] = useState<any>(null);
  const [defectDensity, setDefectDensity] = useState<any>(null);
  const [defectsByModule, setDefectsByModule] = useState<any>(null);
  const [severitySummary, setSeveritySummary] = useState<any>(null);


  // SUPER FAST: Load main data immediately, colors in background
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setIsLoading(true);
      }
      setError(null);

      // Get auth token
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) {
        setError('Session expired. Please log in again.');
        setIsLoading(false);
        if (isRefresh) setRefreshing(false);
        return;
      }
      const fetchOptions = {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      };

      // FAST: Only load essential data first
      console.log('API CALL:', `${BASE_URL}/projects`);
      console.log('API CALL:', `${BASE_URL}/defect-statuses`);
      const [projectsResponse, defectsResponse] = await Promise.all([
        fetch(`${BASE_URL}/projects`, fetchOptions),
        fetch(`${BASE_URL}/defect-statuses`, fetchOptions)
      ]);
      if (!projectsResponse.ok || !defectsResponse.ok) {
        try {
          console.log('Projects status', projectsResponse.status, await projectsResponse.text());
        } catch {}
        try {
          console.log('Defects status', defectsResponse.status, await defectsResponse.text());
        } catch {}
        throw new Error('Failed to fetch data from server');
      }

      const [projectsData, defectsData] = await Promise.all([
        projectsResponse.json(),
        defectsResponse.json()
      ]);

      // Normalize API shapes
      const normalizedProjects = Array.isArray(projectsData?.data?.projects)
        ? projectsData.data.projects
        : Array.isArray(projectsData?.data)
          ? projectsData.data
          : Array.isArray(projectsData)
            ? projectsData
            : [];

      const normalizedDefects = Array.isArray(defectsData?.data?.['defect-statuses'])
        ? defectsData.data['defect-statuses']
        : Array.isArray(defectsData?.data)
          ? defectsData.data
          : Array.isArray(defectsData)
            ? defectsData
            : [];

      setProjects(normalizedProjects);
      setDefects(normalizedDefects);

      // --- Additional Dashboard API Integrations ---
      // Use the first project as a sample for dashboard-wide stats (customize as needed)
      if (normalizedProjects.length > 0) {
        const projectId = normalizedProjects[0].id;
        // Log API URLs only
        console.log('API CALL:', `/dashboard/defect-remark-ratio?projectId=${projectId}`);
        console.log('API CALL:', `/dashboard/dsi/${projectId}`);
        console.log('API CALL:', `/dashboard/defect-type/${projectId}`);
        console.log('API CALL:', `/dashboard/reopen-count_summary/${projectId}`);
        console.log('API CALL:', `/dashboard/defect-density/${projectId}`);
        console.log('API CALL:', `/dashboard/module?projectId=${projectId}`);
        console.log('API CALL:', `/dashboard/defect_severity_summary/${projectId}`);

        // Fetch all dashboard APIs in parallel
        const [
          remarkRatioRes,
          severityIndexRes,
          defectTypesRes,
          reopenSummaryRes,
          defectDensityRes,
          defectsByModuleRes,
          severitySummaryRes
        ] = await Promise.all([
          getDefectRemarkRatioByProjectId(projectId, authToken).catch(() => null),
          getDefectSeverityIndex(projectId, authToken).catch(() => null),
          getDefectTypeByProjectId(projectId, authToken).catch(() => null),
          getReopenCountSummary(projectId, authToken).catch(() => null),
          getDefectDensity(projectId, authToken).catch(() => null),
          getDefectsByModule(projectId, authToken).catch(() => null),
          getDefectSeveritySummary(projectId, authToken).catch(() => null),
        ]);
        setRemarkRatio(remarkRatioRes);
        setSeverityIndex(severityIndexRes);
        setDefectTypes(defectTypesRes);
        setReopenSummary(reopenSummaryRes);
        setDefectDensity(defectDensityRes);
        setDefectsByModule(defectsByModuleRes);
        setSeveritySummary(severitySummaryRes);
      }
      // IMMEDIATE: Show UI instantly with default colors
      setIsLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }

      // BACKGROUND: Load colors after UI is shown (non-blocking)
      if (normalizedProjects.length > 0) {
        loadProjectColors(normalizedProjects, authToken);
      }

    } catch (error) {
      console.error('Dashboard loading error:', error);
      setError('Failed to load dashboard data. Please try again.');
      setIsLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  }, []);

  // BACKGROUND: Load colors without blocking UI
  const loadProjectColors = useCallback(async (projects: any[], authToken: string) => {
    setLoadingColors(true);
    const mapColorNameToHex = (name?: string | null): string => {
      const n = (name || '').toLowerCase();
      if (n === 'red') return '#ce1111';
      if (n === 'yellow') return '#eed61c';
      if (n === 'green') return '#06ba0b';
      return '#06ba0b';
    };

    const determineProjectColor = async (projectId: number): Promise<string> => {
      try {
        const [densityRes, dsiRes, remarkRes] = await Promise.all([
          getDefectDensity(projectId, authToken).catch(() => null),
          getDefectSeverityIndex(projectId, authToken).catch(() => null),
          getDefectRemarkRatioByProjectId(projectId, authToken).catch(() => null)
        ]);

        const densityColorName = densityRes?.data?.color || null;
        const dsiColorName = dsiRes?.data?.color || null;
        const remarkColorName = remarkRes?.data?.color || null;

        const colors = [densityColorName, dsiColorName, remarkColorName].map(c => (c || '').toLowerCase());

        if (colors.includes('red')) return mapColorNameToHex('red');
        if (colors.includes('yellow')) return mapColorNameToHex('yellow');
        return mapColorNameToHex('green');
      } catch {
        return '#888';
      }
    };
    // Load only first 5 colors immediately, rest in batches
    const priorityProjects = projects.slice(0, 5);
    const remainingProjects = projects.slice(5);

    try {
    // Load priority colors first
    const priorityPromises = priorityProjects.map(async (project: any) => {
      const color = await determineProjectColor(project.id);
      return { projectId: project.id, color };
    });

      const priorityResults = await Promise.all(priorityPromises);
      const colorMap: { [projectId: number]: string } = {};
      priorityResults.forEach(({ projectId, color }) => {
        colorMap[projectId] = color;
      });
      setCardColors(colorMap);

      // Load remaining colors in background (don't wait)
      if (remainingProjects.length > 0) {
        setTimeout(async () => {
          const remainingPromises = remainingProjects.map(async (project: any) => {
            const color = await determineProjectColor(project.id);
            return { projectId: project.id, color };
          });

          const remainingResults = await Promise.all(remainingPromises);
          const updatedColorMap = { ...colorMap };
          remainingResults.forEach(({ projectId, color }) => {
            updatedColorMap[projectId] = color;
          });
          setCardColors(updatedColorMap);
        }, 100);
      }
    } catch (error) {
      console.error('Color loading error:', error);
    } finally {
      setLoadingColors(false);
    }
  }, []);

  // Handle pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData(true);
  }, [loadDashboardData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  function parseColorString(colorString: string): string {
    // Example: "bg-gradient-to-r from-red-600 to-red-800"
    const lowerColor = colorString.toLowerCase();
    if (lowerColor.includes('red')) return '#ce1111';
    if (lowerColor.includes('yellow') || lowerColor.includes('amber') || lowerColor.includes('orange')) return '#eed61c';
    if (lowerColor.includes('green') || lowerColor.includes('emerald')) return '#06ba0b';
    return '#888'; // fallback
  }

  // SUPER FAST: Pre-compute defect lookup table (NO LOOPS IN RENDER)
  const defectsByProject = useMemo(() => {
    const lookup: { [projectId: number]: Defect[] } = {};
    defects.forEach(defect => {
      if (!lookup[defect.projectId]) {
        lookup[defect.projectId] = [];
      }
      lookup[defect.projectId].push(defect);
    });
    return lookup;
  }, [defects]);

  // FAST: Simple risk calculation (NO LOOPS)
  const getRiskTextByColor = (projectColor: string): string => {
    if (projectColor === '#ce1111') return 'High Risk';
    if (projectColor === '#eed61c') return 'Medium Risk';
    if (projectColor === '#06ba0b') return 'Low Risk';
    return 'Low Risk';
  };

  // SUPER FAST: All calculations in ONE pass (NO NESTED LOOPS)
  const { projectRisks, riskCounts, filteredProjects } = useMemo(() => {
    const risks: { [projectId: number]: 'high' | 'medium' | 'low' } = {};
    const counts = { high: 0, medium: 0, low: 0 };
    const filtered: Project[] = [];

    // SINGLE LOOP: Calculate everything at once
    projects.forEach(project => {
      let risk: 'high' | 'medium' | 'low' = 'low';

      // Check color first (fastest)
      const projectColor = cardColors[project.id];
      if (projectColor === '#ce1111') {
        risk = 'high';
      } else if (projectColor === '#eed61c') {
        risk = 'medium';
      } else if (projectColor === '#06ba0b') {
        risk = 'low';
      } else {
        // Fallback to defects (use pre-computed lookup)
        const projectDefects = defectsByProject[project.id] || [];
        if (projectDefects.some(d => d.defectStatusName === 'REOPEN' || d.defectStatusName === 'NEW')) {
          risk = 'high';
        } else if (projectDefects.some(d => d.defectStatusName === 'OPEN')) {
          risk = 'medium';
        }
      }

      risks[project.id] = risk;
      counts[risk]++;

      // Filter in same loop
      if (riskFilter === 'all' || risk === riskFilter) {
        filtered.push(project);
      }
    });

    return { projectRisks: risks, riskCounts: counts, filteredProjects: filtered };
  }, [projects, cardColors, defectsByProject, riskFilter]);



  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header onLogoutPress={onLogoutPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
        <Footer
          activeTab="dashboard"
          onDashboardPress={() => {}}
          onProjectsPress={() => {}}
          onAnalyticsPress={() => {}}
          onProfilePress={onProfilePress}
        />
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header onLogoutPress={onLogoutPress} />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color="#ce1111" />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadDashboardData()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
        <Footer
          activeTab="dashboard"
          onDashboardPress={() => {}}
          onProjectsPress={() => {}}
          onAnalyticsPress={() => {}}
          onProfilePress={onProfilePress}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header onLogoutPress={onLogoutPress} />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Heading */}
        <Text style={styles.heading}>Dashboard Overview</Text>
        <Text style={styles.subtitle}>
          Gain insights into your projects with real-time health metrics and status summaries
        </Text>

      {/* Project Status Insights */}
            <Text style={styles.sectionTitle}>Project Status Insights</Text>
      <View style={styles.statusRow}>
        <StatusCard
          color="#ce1111"
          icon="⚠️"
          title="High Risk Projects"
          count={riskCounts.high}
          subtitle="Attention required"
        />
        <StatusCard
          color="#eed61c"
          icon="⚡"
          title="Medium Risk Projects"
          count={riskCounts.medium}
          subtitle="Monitor progress"
        />
        <StatusCard
          color="#06ba0b"
          icon="✅"
          title="Low Risk Projects"
          count={riskCounts.low}
          subtitle="Stable and on track"
        />
              </View>

      {/* All Projects */}
            <Text style={styles.sectionTitle}>All Projects</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollContainer}
        contentContainerStyle={styles.filterContentContainer}
      >
        {['all', 'high', 'medium', 'low'].map(risk => (
                  <TouchableOpacity
            key={risk}
                    style={[
                      styles.filterButton,
              riskFilter === risk && {
                backgroundColor:
                  risk === 'high' ? '#ce1111' :
                  risk === 'medium' ? '#eed61c' :
                  risk === 'low' ? '#06ba0b' : '#3b82f6'
              }
                    ]}
            onPress={() => setRiskFilter(risk as 'all' | 'high' | 'medium' | 'low')}
                  >
            <Text style={[
                        styles.filterButtonText,
              riskFilter === risk && { color: '#fff' }
            ]}>
              {risk === 'all'
                ? 'All Projects'
                : risk.charAt(0).toUpperCase() + risk.slice(1) + ' Risk'}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

        {/* Project Cards */}
        {filteredProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="folder-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Projects Found</Text>
            <Text style={styles.emptyStateMessage}>
              {riskFilter === 'all'
                ? 'No projects available at the moment.'
                : `No ${riskFilter} risk projects found.`}
            </Text>
          </View>
        ) : (
          <View style={styles.projectCardsRow}>
            {([...filteredProjects].sort((a, b) => {
              const priority: { [k in 'high' | 'medium' | 'low']: number } = { high: 0, medium: 1, low: 2 };
              const ra = projectRisks[a.id] || 'low';
              const rb = projectRisks[b.id] || 'low';
              return priority[ra] - priority[rb];
            })).map((project) => {
              const risk = projectRisks[project.id];
              const projectColor = cardColors[project.id] || getRiskColor(risk);
              const isColorLoading = loadingColors && !cardColors[project.id];
              return (
                <View key={project.id} style={styles.projectCardWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.projectCard,
                      { backgroundColor: projectColor }
                    ]}
                    onPress={() => {
                      if (onProjectPress) {
                        onProjectPress(project.id, project.projectName);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.projectCardText}>{project.name || project.projectName || 'Unnamed'}</Text>
                    <View style={[
                      styles.riskLabel,
                      { backgroundColor: 'rgba(0,0,0,0.2)' }
                    ]}>
                      {isColorLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.riskLabelText}>{getRiskTextByColor(projectColor)}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
      <Footer
        activeTab="dashboard"
        onDashboardPress={() => {}}
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

// Status Card Component
function StatusCard({ color, icon, title, count, subtitle }: {
  color: string;
  icon: string;
  title: string;
  count: number;
  subtitle: string;
}) {
  return (
    <View style={[styles.statusCard, { borderColor: color }]}>
      <Text style={styles.statusCardIcon}>{icon}</Text>
      <Text style={[styles.statusCardTitle, { color }]}>{title}</Text>
      <Text style={[styles.statusCardCount, { color }]}>{count}</Text>
      <Text style={styles.statusCardSubtitle}>{subtitle}</Text>
        </View>
  );
}




const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  heading: { fontSize: 28, fontWeight: 'bold', marginTop: 1, textAlign: 'center', color: '#222' },
  subtitle: { fontSize: 15, color: '#555', textAlign: 'center', marginVertical: 4 },
  divider: { height: 4, width: 80, backgroundColor: '#3b82f6', borderRadius: 2, alignSelf: 'center', marginVertical: 12 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#222', marginTop: 20, marginBottom: 16 },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ce1111',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Empty states
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    marginTop: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },

  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statusCard: {
    flex: 1, marginHorizontal: 4, backgroundColor: '#fff', borderRadius: 16, borderWidth: 2,
    alignItems: 'center', padding: 12, elevation: 2
  },
  statusCardIcon: { fontSize: 32, marginBottom: 4 },
  statusCardTitle: { fontSize: 11.7, fontWeight: 'bold', marginTop: 4 },
  statusCardCount: { fontSize: 28, fontWeight: 'bold', marginVertical: 2 },
  statusCardSubtitle: { fontSize: 12, color: '#888', textAlign: 'center' },
  filterScrollContainer: {
    marginVertical: 4,
  },
  filterContentContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  filterButtonText: { color: '#222', fontWeight: 'bold' },
  projectCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 20,
    paddingHorizontal: 12,
  },
  projectCardWrapper: {
    width: '33.33%', // keep 3 per row
    marginBottom: 14,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  projectCard: {
    width: 112,
    height: 113,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    position: 'relative',
    borderWidth: 5,
    borderColor: '#fff',
    backgroundColor: '#ce1111', // fallback
  },
  projectCardText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 10,
    paddingHorizontal: 6,
  },
  riskLabel: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    borderRadius: 11,
    paddingVertical: 2,
    paddingHorizontal: 6,
    alignItems: 'center',
    maxWidth: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)', // Semi-transparent overlay
  },
  riskLabelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default DashboardScreen;