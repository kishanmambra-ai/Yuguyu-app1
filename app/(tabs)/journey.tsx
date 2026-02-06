import { useDiet } from "@/contexts/DietContext";
import { useWorkouts } from "@/contexts/WorkoutContext";
import Colors from "@/constants/colors";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Dumbbell, Clock, TrendingUp, TrendingDown, Award, Zap, Target, Calendar, Flame, Droplets, Scale, Activity, MapPin, ChevronDown, ChevronUp } from "lucide-react-native";
import { 
  calculatePersonalBests, 
  getTopExercises, 
  analyzeMuscleGroups, 
  calculateStrengthProgress, 
  getMuscleGroupInsights,
  MuscleGroupStats,
  StrengthProgress 
} from "@/utils/workout-stats";

type TimeRange = "weekly" | "monthly";

interface GraphData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  weight?: number;
}

interface ProgressSummary {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

function calculateProgress(current: number, previous: number): ProgressSummary {
  const change = current - previous;
  const changePercent = previous > 0 ? (change / previous) * 100 : 0;
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
  return { current, previous, change, changePercent, trend };
}

function ProgressCard({
  title,
  icon,
  color,
  current,
  previous,
  unit,
  higherIsBetter = true,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  current: number;
  previous: number;
  unit: string;
  higherIsBetter?: boolean;
}) {
  const progress = calculateProgress(current, previous);
  const isPositive = higherIsBetter ? progress.trend === 'up' : progress.trend === 'down';
  const isNegative = higherIsBetter ? progress.trend === 'down' : progress.trend === 'up';

  return (
    <View style={styles.progressCard}>
      <View style={[styles.progressIconContainer, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <View style={styles.progressContent}>
        <Text style={styles.progressTitle}>{title}</Text>
        <Text style={styles.progressValue}>
          {current.toFixed(unit === 'kg' ? 1 : 0)}
          <Text style={styles.progressUnit}>{` ${unit}`}</Text>
        </Text>
      </View>
      <View style={styles.progressChangeContainer}>
        {progress.trend !== 'stable' && (
          <>
            {isPositive ? (
              <TrendingUp size={16} color="#34C759" />
            ) : isNegative ? (
              <TrendingDown size={16} color="#FF3B30" />
            ) : (
              <TrendingUp size={16} color={Colors.textSecondary} />
            )}
            <Text style={[
              styles.progressChange,
              isPositive && styles.progressPositive,
              isNegative && styles.progressNegative,
            ]}>
              {progress.change > 0 ? '+' : ''}{progress.change.toFixed(unit === 'kg' ? 1 : 0)}
            </Text>
          </>
        )}
        {progress.trend === 'stable' && (
          <Text style={styles.progressStable}>No change</Text>
        )}
      </View>
    </View>
  );
}

function InsightCard({
  emoji,
  title,
  description,
  type,
}: {
  emoji: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info';
}) {
  const bgColor = type === 'success' ? '#34C75910' : type === 'warning' ? '#FF950010' : '#007AFF10';
  const borderColor = type === 'success' ? '#34C75930' : type === 'warning' ? '#FF950030' : '#007AFF30';

  return (
    <View style={[styles.insightCard, { backgroundColor: bgColor, borderColor }]}>
      <Text style={styles.insightEmoji}>{emoji}</Text>
      <View style={styles.insightContent}>
        <Text style={styles.insightTitle}>{title}</Text>
        <Text style={styles.insightDescription}>{description}</Text>
      </View>
    </View>
  );
}

function MuscleGroupBar({
  stat,
  maxVolume,
  isStrong,
  needsWork,
}: {
  stat: MuscleGroupStats;
  maxVolume: number;
  isStrong: boolean;
  needsWork: boolean;
}) {
  const barWidth = maxVolume > 0 ? (stat.totalVolume / maxVolume) * 100 : 0;
  const barColor = isStrong ? '#34C759' : needsWork ? '#FF9500' : Colors.primaryAccent;
  
  const muscleEmojis: Record<string, string> = {
    'Chest': '🫁',
    'Back': '🔙',
    'Shoulders': '💪',
    'Arms': '💪',
    'Legs': '🦵',
    'Core': '🎯',
    'Glutes': '🍑',
    'Calves': '🦶',
  };

  return (
    <View style={styles.muscleGroupItem}>
      <View style={styles.muscleGroupHeader}>
        <Text style={styles.muscleGroupEmoji}>{muscleEmojis[stat.muscleGroup] || '💪'}</Text>
        <Text style={styles.muscleGroupName}>{stat.muscleGroup}</Text>
        {isStrong && <Text style={styles.muscleGroupBadge}>Strong</Text>}
        {needsWork && <Text style={[styles.muscleGroupBadge, styles.muscleGroupBadgeWeak]}>Needs Work</Text>}
      </View>
      <View style={styles.muscleGroupBarContainer}>
        <View style={[styles.muscleGroupBar, { width: `${Math.max(barWidth, 2)}%`, backgroundColor: barColor }]} />
      </View>
      <View style={styles.muscleGroupStats}>
        <Text style={styles.muscleGroupStatText}>{stat.totalSets} sets</Text>
        <Text style={styles.muscleGroupStatDot}>•</Text>
        <Text style={styles.muscleGroupStatText}>{(stat.totalVolume / 1000).toFixed(1)}k kg</Text>
        <Text style={styles.muscleGroupStatDot}>•</Text>
        <Text style={styles.muscleGroupStatText}>{stat.frequency}x trained</Text>
      </View>
    </View>
  );
}

function StrengthProgressItem({ progress }: { progress: StrengthProgress }) {
  return (
    <View style={styles.strengthItem}>
      <View style={styles.strengthLeft}>
        <Text style={styles.strengthExercise}>{progress.exerciseName}</Text>
        <Text style={styles.strengthMax}>{progress.currentMax} kg max</Text>
      </View>
      <View style={styles.strengthRight}>
        {progress.trend === 'up' ? (
          <View style={styles.strengthChangeUp}>
            <TrendingUp size={14} color="#34C759" />
            <Text style={styles.strengthChangeTextUp}>+{progress.change} kg</Text>
          </View>
        ) : progress.trend === 'down' ? (
          <View style={styles.strengthChangeDown}>
            <TrendingDown size={14} color="#FF3B30" />
            <Text style={styles.strengthChangeTextDown}>{progress.change} kg</Text>
          </View>
        ) : (
          <Text style={styles.strengthStable}>Stable</Text>
        )}
      </View>
    </View>
  );
}

function WorkoutHistoryItem({ 
  workout, 
  formatDuration 
}: { 
  workout: any; 
  formatDuration: (start: string, end: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  
  const totalVolume = workout.exercises.reduce((sum: number, ex: any) => {
    return sum + ex.sets.reduce((setSum: number, set: any) => {
      if (set.completed && set.weight && set.reps) {
        return setSum + set.weight * set.reps;
      }
      return setSum;
    }, 0);
  }, 0);

  return (
    <TouchableOpacity 
      style={styles.workoutCard} 
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutTitleRow}>
          <Dumbbell size={18} color={Colors.primaryAccent} />
          <Text style={styles.workoutName} numberOfLines={1}>{workout.routineName}</Text>
        </View>
        {expanded ? (
          <ChevronUp size={18} color={Colors.textSecondary} />
        ) : (
          <ChevronDown size={18} color={Colors.textSecondary} />
        )}
      </View>
      <View style={styles.workoutStats}>
        <View style={styles.workoutStat}>
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.workoutStatText}>{formatDuration(workout.startedAt, workout.completedAt)}</Text>
        </View>
        <View style={styles.workoutStatDivider} />
        <Text style={styles.workoutStatText}>{workout.exercises.length} exercises</Text>
        <View style={styles.workoutStatDivider} />
        <Text style={styles.workoutStatText}>{(totalVolume / 1000).toFixed(1)}k kg</Text>
      </View>
      {expanded && (
        <View style={styles.exercisesList}>
          {workout.exercises.map((exercise: any, idx: number) => {
            const completedSets = exercise.sets.filter((s: any) => s.completed);
            const maxWeight = Math.max(...completedSets.map((s: any) => s.weight || 0));
            return (
              <View key={idx} style={styles.exerciseItem}>
                <Text style={styles.exerciseItemName}>{exercise.name}</Text>
                <Text style={styles.exerciseItemStats}>
                  {completedSets.length} sets
                  {maxWeight > 0 && ` • ${maxWeight} kg`}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </TouchableOpacity>
  );
}

function CardioHistoryItem({ activity }: { activity: any }) {
  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${meters.toFixed(0)}m`;
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'running': return '🏃';
      case 'cycling': return '🚴';
      case 'walking': return '🚶';
      case 'hiking': return '🥾';
      default: return '🏃';
    }
  };

  return (
    <View style={styles.cardioCard}>
      <View style={styles.cardioHeader}>
        <Text style={styles.cardioIcon}>{getActivityIcon(activity.type)}</Text>
        <Text style={styles.cardioType}>{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</Text>
      </View>
      <View style={styles.cardioStats}>
        <View style={styles.cardioStat}>
          <MapPin size={14} color={Colors.textSecondary} />
          <Text style={styles.cardioStatText}>{formatDistance(activity.distance)}</Text>
        </View>
        <View style={styles.cardioStatDivider} />
        <View style={styles.cardioStat}>
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.cardioStatText}>{formatDuration(activity.duration)}</Text>
        </View>
        {activity.calories && (
          <>
            <View style={styles.cardioStatDivider} />
            <View style={styles.cardioStat}>
              <Flame size={14} color={Colors.textSecondary} />
              <Text style={styles.cardioStatText}>{activity.calories} cal</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

export default function JourneyScreen() {
  const { getHistoricalData } = useDiet();
  const { history: workoutHistory, cardioHistory } = useWorkouts();
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");
  const [currentData, setCurrentData] = useState<GraphData[]>([]);
  const [previousData, setPreviousData] = useState<GraphData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'nutrition' | 'workouts'>('nutrition');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const days = timeRange === "weekly" ? 7 : 30;
      
      const currentHistorical = await getHistoricalData(days);
      setCurrentData(Array.isArray(currentHistorical) ? currentHistorical : []);
      
      const previousHistorical = await getHistoricalData(days * 2);
      if (Array.isArray(previousHistorical) && previousHistorical.length > days) {
        setPreviousData(previousHistorical.slice(0, days));
      } else {
        setPreviousData([]);
      }
    } catch (error) {
      console.error('Failed to load journey data:', error);
      setCurrentData([]);
      setPreviousData([]);
    } finally {
      setLoading(false);
    }
  }, [timeRange, getHistoricalData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const calculateAverage = (data: GraphData[], key: keyof GraphData): number => {
    const values = data.map(d => {
      const val = d[key];
      return typeof val === 'number' && !isNaN(val) ? val : 0;
    }).filter(v => v > 0);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  };

  const currentCalories = calculateAverage(currentData, 'calories');
  const previousCalories = calculateAverage(previousData, 'calories');
  const currentProtein = calculateAverage(currentData, 'protein');
  const previousProtein = calculateAverage(previousData, 'protein');
  const currentCarbs = calculateAverage(currentData, 'carbs');
  const previousCarbs = calculateAverage(previousData, 'carbs');
  const currentFat = calculateAverage(currentData, 'fat');
  const previousFat = calculateAverage(previousData, 'fat');
  const currentWater = calculateAverage(currentData, 'water');
  const previousWater = calculateAverage(previousData, 'water');
  
  const weightData = currentData.filter(d => d.weight && d.weight > 0);
  const prevWeightData = previousData.filter(d => d.weight && d.weight > 0);
  const currentWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight || 0 : 0;
  const previousWeight = prevWeightData.length > 0 ? prevWeightData[prevWeightData.length - 1].weight || 0 : 0;

  const hasData = currentData.some(
    (d) => d.calories > 0 || d.protein > 0 || d.carbs > 0 || d.fat > 0 || d.water > 0 || d.weight
  );

  const daysLogged = currentData.filter(d => d.calories > 0).length;
  const totalDays = timeRange === "weekly" ? 7 : 30;
  const consistencyPercent = Math.round((daysLogged / totalDays) * 100);

  const generateInsights = () => {
    const insights: { emoji: string; title: string; description: string; type: 'success' | 'warning' | 'info' }[] = [];

    if (consistencyPercent >= 80) {
      insights.push({
        emoji: '🔥',
        title: 'Great Consistency!',
        description: `You logged ${daysLogged} out of ${totalDays} days. Keep up the great work!`,
        type: 'success',
      });
    } else if (consistencyPercent >= 50) {
      insights.push({
        emoji: '💪',
        title: 'Building Momentum',
        description: `You logged ${daysLogged} days. Try to log daily for better tracking.`,
        type: 'info',
      });
    } else if (daysLogged > 0) {
      insights.push({
        emoji: '📝',
        title: 'Room for Improvement',
        description: `Only ${daysLogged} days logged. Consistent tracking helps reach goals faster.`,
        type: 'warning',
      });
    }

    if (currentProtein > 0 && previousProtein > 0) {
      const proteinChange = ((currentProtein - previousProtein) / previousProtein) * 100;
      if (proteinChange > 10) {
        insights.push({
          emoji: '💪',
          title: 'Protein Boost',
          description: `Your protein intake increased by ${Math.round(proteinChange)}%. Great for muscle recovery!`,
          type: 'success',
        });
      } else if (proteinChange < -10) {
        insights.push({
          emoji: '🥩',
          title: 'Protein Tip',
          description: 'Protein intake is lower than last period. Consider adding more protein sources.',
          type: 'warning',
        });
      }
    }

    if (currentWater > 0) {
      if (currentWater >= 8) {
        insights.push({
          emoji: '💧',
          title: 'Hydration Champion',
          description: `Averaging ${currentWater.toFixed(1)} glasses daily. Excellent hydration!`,
          type: 'success',
        });
      } else if (currentWater < 6) {
        insights.push({
          emoji: '🥤',
          title: 'Drink More Water',
          description: 'Aim for 8 glasses daily for optimal health and energy.',
          type: 'warning',
        });
      }
    }

    if (currentWeight > 0 && previousWeight > 0) {
      const weightChange = currentWeight - previousWeight;
      if (Math.abs(weightChange) > 0.5) {
        insights.push({
          emoji: weightChange < 0 ? '📉' : '📈',
          title: `Weight ${weightChange < 0 ? 'Decreased' : 'Increased'}`,
          description: `Your weight changed by ${Math.abs(weightChange).toFixed(1)} kg compared to before.`,
          type: 'info',
        });
      }
    }

    return insights;
  };

  const insights = generateInsights();

  const days = timeRange === "weekly" ? 7 : 30;
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const previousCutoffDate = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

  const filteredWorkoutHistory = useMemo(() => 
    workoutHistory.filter((workout) => {
      const completedDate = new Date(workout.completedAt);
      return completedDate >= cutoffDate;
    }).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()),
    [workoutHistory, cutoffDate]
  );

  const previousWorkoutHistory = useMemo(() =>
    workoutHistory.filter((workout) => {
      const completedDate = new Date(workout.completedAt);
      return completedDate >= previousCutoffDate && completedDate < cutoffDate;
    }),
    [workoutHistory, cutoffDate, previousCutoffDate]
  );

  const filteredCardioHistory = useMemo(() =>
    cardioHistory.filter((activity) => {
      const completedDate = new Date(activity.completedAt || activity.startedAt);
      return completedDate >= cutoffDate;
    }).sort((a, b) => new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime()),
    [cardioHistory, cutoffDate]
  );

  const totalWorkouts = filteredWorkoutHistory.length;
  const totalCardioActivities = filteredCardioHistory.length;
  const totalActivities = totalWorkouts + totalCardioActivities;
  
  const totalVolume = filteredWorkoutHistory.reduce((sum, workout) => {
    return sum + workout.exercises.reduce((exerciseSum, exercise) => {
      return exerciseSum + exercise.sets.reduce((setSum, set) => {
        if (set.completed && set.weight && set.reps) {
          return setSum + set.weight * set.reps;
        }
        return setSum;
      }, 0);
    }, 0);
  }, 0);

  const totalDuration = filteredWorkoutHistory.reduce((sum, workout) => {
    return sum + (new Date(workout.completedAt).getTime() - new Date(workout.startedAt).getTime());
  }, 0);

  const totalMinutes = Math.floor(totalDuration / 60000);
  const avgDuration = totalWorkouts > 0 ? Math.floor(totalMinutes / totalWorkouts) : 0;

  const personalBests = useMemo(() => calculatePersonalBests(filteredWorkoutHistory), [filteredWorkoutHistory]);
  const topExercises = useMemo(() => getTopExercises(filteredWorkoutHistory, 3), [filteredWorkoutHistory]);
  
  const muscleGroupStats = useMemo(() => analyzeMuscleGroups(filteredWorkoutHistory), [filteredWorkoutHistory]);
  const muscleInsights = useMemo(() => getMuscleGroupInsights(muscleGroupStats), [muscleGroupStats]);
  const maxMuscleVolume = useMemo(() => Math.max(...muscleGroupStats.map(s => s.totalVolume), 1), [muscleGroupStats]);
  
  const strengthProgress = useMemo(() => 
    calculateStrengthProgress(filteredWorkoutHistory, previousWorkoutHistory),
    [filteredWorkoutHistory, previousWorkoutHistory]
  );

  const formatDuration = (startedAt: string, completedAt: string) => {
    const duration = new Date(completedAt).getTime() - new Date(startedAt).getTime();
    const minutes = Math.floor(duration / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const generateWorkoutInsights = () => {
    const insights: { emoji: string; title: string; description: string; type: 'success' | 'warning' | 'info' }[] = [];

    const expectedWorkouts = timeRange === "weekly" ? 3 : 12;
    if (totalActivities >= expectedWorkouts) {
      insights.push({
        emoji: '🏆',
        title: 'Crushing Your Goals!',
        description: `${totalActivities} activities completed. You're on fire!`,
        type: 'success',
      });
    } else if (totalActivities > 0) {
      insights.push({
        emoji: '🎯',
        title: 'Keep Going',
        description: `${totalActivities} activities so far. Aim for ${expectedWorkouts} per ${timeRange === 'weekly' ? 'week' : 'month'}.`,
        type: 'info',
      });
    }

    if (personalBests.length > 0) {
      insights.push({
        emoji: '🏅',
        title: 'New Personal Records!',
        description: `You set ${personalBests.length} PR${personalBests.length > 1 ? 's' : ''} this period!`,
        type: 'success',
      });
    }

    if (!muscleInsights.balanced && muscleInsights.needsWork.length > 0) {
      const needsWorkNames = muscleInsights.needsWork.map(m => m.muscleGroup).join(', ');
      insights.push({
        emoji: '⚖️',
        title: 'Balance Your Training',
        description: `Consider adding more ${needsWorkNames} exercises for balanced development.`,
        type: 'warning',
      });
    }

    if (muscleInsights.strong.length > 0) {
      const strongNames = muscleInsights.strong.map(m => m.muscleGroup).join(', ');
      insights.push({
        emoji: '💪',
        title: 'Strong Points',
        description: `Your ${strongNames} training is excellent! Keep it up.`,
        type: 'success',
      });
    }

    const strengthGains = strengthProgress.filter(p => p.trend === 'up');
    if (strengthGains.length >= 3) {
      insights.push({
        emoji: '📈',
        title: 'Getting Stronger!',
        description: `You've increased max weight on ${strengthGains.length} exercises!`,
        type: 'success',
      });
    }

    return insights;
  };

  const workoutInsights = generateWorkoutInsights();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <View style={styles.tabButtons}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "nutrition" && styles.tabButtonActive]}
            onPress={() => setActiveTab("nutrition")}
          >
            <Text style={[styles.tabButtonText, activeTab === "nutrition" && styles.tabButtonTextActive]}>
              Nutrition
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "workouts" && styles.tabButtonActive]}
            onPress={() => setActiveTab("workouts")}
          >
            <Text style={[styles.tabButtonText, activeTab === "workouts" && styles.tabButtonTextActive]}>
              Workouts
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.timeRangeButtons}>
          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === "weekly" && styles.timeRangeButtonActive]}
            onPress={() => setTimeRange("weekly")}
          >
            <Calendar size={14} color={timeRange === "weekly" ? "#FFF" : Colors.textSecondary} />
            <Text
              style={[
                styles.timeRangeButtonText,
                timeRange === "weekly" && styles.timeRangeButtonTextActive,
              ]}
            >
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === "monthly" && styles.timeRangeButtonActive]}
            onPress={() => setTimeRange("monthly")}
          >
            <Calendar size={14} color={timeRange === "monthly" ? "#FFF" : Colors.textSecondary} />
            <Text
              style={[
                styles.timeRangeButtonText,
                timeRange === "monthly" && styles.timeRangeButtonTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryAccent} />
        </View>
      ) : activeTab === 'nutrition' ? (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {!hasData ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyTitle}>No Data Yet</Text>
              <Text style={styles.emptyText}>
                Start logging your meals to see your progress here!
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.summaryHeader}>
                <Text style={styles.sectionTitle}>
                  {timeRange === 'weekly' ? 'This Week' : 'This Month'}
                </Text>
                <View style={styles.consistencyBadge}>
                  <Text style={styles.consistencyText}>{consistencyPercent}% logged</Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <ProgressCard
                  title="Avg. Calories"
                  icon={<Flame size={20} color="#FF6B6B" />}
                  color="#FF6B6B"
                  current={currentCalories}
                  previous={previousCalories}
                  unit="kcal"
                />
                <ProgressCard
                  title="Avg. Protein"
                  icon={<Target size={20} color="#4ECDC4" />}
                  color="#4ECDC4"
                  current={currentProtein}
                  previous={previousProtein}
                  unit="g"
                />
                <ProgressCard
                  title="Avg. Carbs"
                  icon={<Zap size={20} color="#FFE66D" />}
                  color="#FFE66D"
                  current={currentCarbs}
                  previous={previousCarbs}
                  unit="g"
                />
                <ProgressCard
                  title="Avg. Fat"
                  icon={<Target size={20} color="#95E1D3" />}
                  color="#95E1D3"
                  current={currentFat}
                  previous={previousFat}
                  unit="g"
                />
                <ProgressCard
                  title="Avg. Water"
                  icon={<Droplets size={20} color="#74B9FF" />}
                  color="#74B9FF"
                  current={currentWater}
                  previous={previousWater}
                  unit="glasses"
                />
                {currentWeight > 0 && (
                  <ProgressCard
                    title="Current Weight"
                    icon={<Scale size={20} color="#A29BFE" />}
                    color="#A29BFE"
                    current={currentWeight}
                    previous={previousWeight}
                    unit="kg"
                    higherIsBetter={false}
                  />
                )}
              </View>

              {insights.length > 0 && (
                <View style={styles.insightsSection}>
                  <Text style={styles.sectionTitle}>Insights</Text>
                  {insights.map((insight, index) => (
                    <InsightCard
                      key={index}
                      emoji={insight.emoji}
                      title={insight.title}
                      description={insight.description}
                      type={insight.type}
                    />
                  ))}
                </View>
              )}

              <View style={styles.bottomSpacer} />
            </>
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {filteredWorkoutHistory.length === 0 && filteredCardioHistory.length === 0 ? (
            <View style={styles.emptyWorkoutContainer}>
              <Dumbbell size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyWorkoutTitle}>No Workouts Yet</Text>
              <Text style={styles.emptyWorkoutText}>
                Complete workouts to see your progress here!
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.summaryHeader}>
                <Text style={styles.sectionTitle}>
                  {timeRange === 'weekly' ? 'This Week' : 'This Month'}
                </Text>
              </View>

              <View style={styles.statsOverview}>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: '#FF6B6B15' }]}>
                      <Dumbbell size={20} color="#FF6B6B" />
                    </View>
                    <Text style={styles.statValue}>{totalActivities}</Text>
                    <Text style={styles.statLabel}>Activities</Text>
                  </View>
                  <View style={styles.statCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: '#4ECDC415' }]}>
                      <TrendingUp size={20} color="#4ECDC4" />
                    </View>
                    <Text style={styles.statValue}>{(totalVolume / 1000).toFixed(1)}k</Text>
                    <Text style={styles.statLabel}>Volume (kg)</Text>
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: '#FFE66D15' }]}>
                      <Clock size={20} color="#FFE66D" />
                    </View>
                    <Text style={styles.statValue}>{totalMinutes}</Text>
                    <Text style={styles.statLabel}>Total Minutes</Text>
                  </View>
                  <View style={styles.statCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: '#A29BFE15' }]}>
                      <Zap size={20} color="#A29BFE" />
                    </View>
                    <Text style={styles.statValue}>{avgDuration}</Text>
                    <Text style={styles.statLabel}>Avg Duration</Text>
                  </View>
                </View>
              </View>

              {workoutInsights.length > 0 && (
                <View style={styles.insightsSection}>
                  <Text style={styles.sectionTitle}>Insights</Text>
                  {workoutInsights.map((insight, index) => (
                    <InsightCard
                      key={index}
                      emoji={insight.emoji}
                      title={insight.title}
                      description={insight.description}
                      type={insight.type}
                    />
                  ))}
                </View>
              )}

              {muscleGroupStats.some(s => s.totalSets > 0) && (
                <View style={styles.muscleGroupSection}>
                  <View style={styles.sectionTitleRow}>
                    <Activity size={18} color={Colors.primaryAccent} />
                    <Text style={styles.sectionSubtitle}>Muscle Group Analysis</Text>
                  </View>
                  {muscleGroupStats.map((stat, index) => (
                    <MuscleGroupBar
                      key={index}
                      stat={stat}
                      maxVolume={maxMuscleVolume}
                      isStrong={muscleInsights.strong.some(s => s.muscleGroup === stat.muscleGroup)}
                      needsWork={muscleInsights.needsWork.some(s => s.muscleGroup === stat.muscleGroup)}
                    />
                  ))}
                </View>
              )}

              {strengthProgress.length > 0 && (
                <View style={styles.strengthSection}>
                  <View style={styles.sectionTitleRow}>
                    <TrendingUp size={18} color={Colors.primaryAccent} />
                    <Text style={styles.sectionSubtitle}>Strength Tracking</Text>
                  </View>
                  {strengthProgress.slice(0, 6).map((progress, index) => (
                    <StrengthProgressItem key={index} progress={progress} />
                  ))}
                </View>
              )}

              {personalBests.length > 0 && (
                <View style={styles.personalBestsSection}>
                  <View style={styles.sectionTitleRow}>
                    <Award size={18} color={Colors.primaryAccent} />
                    <Text style={styles.sectionSubtitle}>Personal Records</Text>
                  </View>
                  {personalBests.slice(0, 5).map((pb, index) => (
                    <View key={index} style={styles.personalBestCard}>
                      <View style={styles.pbLeft}>
                        <Text style={styles.pbExercise}>{pb.exerciseName}</Text>
                        <Text style={styles.pbDate}>
                          {new Date(pb.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                      </View>
                      <View style={styles.pbRight}>
                        <Text style={styles.pbWeight}>{pb.weight} kg × {pb.reps}</Text>
                        <Text style={styles.pbVolume}>{pb.volume.toFixed(0)} kg total</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {filteredWorkoutHistory.length > 0 && (
                <View style={styles.historySection}>
                  <View style={styles.sectionTitleRow}>
                    <Dumbbell size={18} color={Colors.primaryAccent} />
                    <Text style={styles.sectionSubtitle}>Workout History</Text>
                  </View>
                  {filteredWorkoutHistory.slice(0, 10).map((workout) => (
                    <WorkoutHistoryItem 
                      key={workout.id} 
                      workout={workout} 
                      formatDuration={formatDuration}
                    />
                  ))}
                </View>
              )}

              {filteredCardioHistory.length > 0 && (
                <View style={styles.historySection}>
                  <View style={styles.sectionTitleRow}>
                    <Activity size={18} color={Colors.primaryAccent} />
                    <Text style={styles.sectionSubtitle}>Cardio History</Text>
                  </View>
                  {filteredCardioHistory.slice(0, 10).map((activity) => (
                    <CardioHistoryItem key={activity.id} activity={activity} />
                  ))}
                </View>
              )}

              <View style={styles.bottomSpacer} />
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  tabButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButtonActive: {
    backgroundColor: Colors.primaryAccent,
    borderColor: Colors.primaryAccent,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabButtonTextActive: {
    color: "#FFF",
  },
  timeRangeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.primaryAccent,
    borderColor: Colors.primaryAccent,
  },
  timeRangeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  timeRangeButtonTextActive: {
    color: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  consistencyBadge: {
    backgroundColor: Colors.primaryAccent + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  consistencyText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primaryAccent,
  },
  progressSection: {
    paddingHorizontal: 16,
    gap: 10,
  },
  progressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  progressContent: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
  },
  progressUnit: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  progressChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  progressChange: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  progressPositive: {
    color: "#34C759",
  },
  progressNegative: {
    color: "#FF3B30",
  },
  progressStable: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  insightsSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 10,
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  insightEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  insightDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 100,
  },
  emptyWorkoutContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyWorkoutTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
  },
  emptyWorkoutText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  statsOverview: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: Platform.OS === 'android' ? 8 : 12,
    padding: 16,
    borderWidth: Platform.OS === 'ios' ? 0 : 1,
    borderColor: Colors.border,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: Platform.OS === 'ios' ? 1 : 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.08 : 0.05,
    shadowRadius: Platform.OS === 'ios' ? 4 : 8,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
    textAlign: "center",
  },
  muscleGroupSection: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  muscleGroupItem: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  muscleGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  muscleGroupEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  muscleGroupName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
  },
  muscleGroupBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#34C759",
    backgroundColor: "#34C75915",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  muscleGroupBadgeWeak: {
    color: "#FF9500",
    backgroundColor: "#FF950015",
  },
  muscleGroupBarContainer: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  muscleGroupBar: {
    height: "100%",
    borderRadius: 4,
  },
  muscleGroupStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  muscleGroupStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  muscleGroupStatDot: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginHorizontal: 6,
  },
  strengthSection: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  strengthItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  strengthLeft: {
    flex: 1,
  },
  strengthExercise: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  strengthMax: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  strengthRight: {
    alignItems: "flex-end",
  },
  strengthChangeUp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  strengthChangeTextUp: {
    fontSize: 14,
    fontWeight: "600",
    color: "#34C759",
  },
  strengthChangeDown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  strengthChangeTextDown: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF3B30",
  },
  strengthStable: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  personalBestsSection: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  personalBestCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pbLeft: {
    flex: 1,
  },
  pbExercise: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  pbDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  pbRight: {
    alignItems: "flex-end",
  },
  pbWeight: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primaryAccent,
    marginBottom: 4,
  },
  pbVolume: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  historySection: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  workoutCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  workoutTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  workoutName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
  },
  workoutStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  workoutStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  workoutStatText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  workoutStatDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  exercisesList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  exerciseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseItemName: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
  },
  exerciseItemStats: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cardioCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardioHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  cardioIcon: {
    fontSize: 20,
  },
  cardioType: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  cardioStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardioStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardioStatText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  cardioStatDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
});
