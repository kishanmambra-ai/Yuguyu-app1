import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { User, TrendingUp, Flame, Dumbbell, Target, Activity, Edit2, Camera, X, LogOut, Lock, ChevronRight, Settings } from "lucide-react-native";
import { useMemo, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { router } from "expo-router";

import Colors from "@/constants/colors";
import { useWorkouts } from "@/contexts/WorkoutContext";
import { useDiet } from "@/contexts/DietContext";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileScreen() {
  const { history, cardioHistory, routines } = useWorkouts();
  const { goals, weightEntries, getLatestWeight } = useDiet();
  const { user, updateProfile, logout } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedPicture, setEditedPicture] = useState(user?.profilePicture || '');

  const latestWeight = getLatestWeight();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setEditedPicture(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        name: editedName.trim() || 'yuguyu',
        profilePicture: editedPicture,
      });
      setEditModalVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const openEditModal = () => {
    setEditedName(user?.name || '');
    setEditedPicture(user?.profilePicture || '');
    setEditModalVisible(true);
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/");
          },
        },
      ]
    );
  };



  const stats = useMemo(() => {
    const totalWorkouts = history.length;
    const totalCardioActivities = cardioHistory.length;
    const totalDistance = cardioHistory.reduce((sum, activity) => sum + activity.distance, 0);
    const totalSets = history.reduce((sum, workout) => sum + workout.totalSets, 0);
    const totalReps = history.reduce((sum, workout) => sum + workout.totalReps, 0);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentWorkouts = history.filter(
      (w) => new Date(w.completedAt) >= last7Days
    ).length;

    let weightChange = 0;
    if (weightEntries.length >= 2) {
      const sorted = [...weightEntries].sort(
        (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
      );
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      if (first.unit === last.unit) {
        weightChange = last.weight - first.weight;
      }
    }

    return {
      totalWorkouts,
      totalCardioActivities,
      totalDistance: totalDistance / 1000,
      totalDistanceFormatted: (totalDistance / 1000).toFixed(1),
      totalSets,
      totalReps,
      recentWorkouts,
      weightChange,
      totalRoutines: routines.length,
    };
  }, [history, cardioHistory, weightEntries, routines]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer} onPress={openEditModal}>
          {user?.profilePicture ? (
            <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <User size={48} color={Colors.text} strokeWidth={1.5} />
          )}
          <View style={styles.editBadge}>
            <Edit2 size={14} color="#FFF" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={openEditModal}>
          <Text style={styles.userName}>{user?.name || "yuguyu"}</Text>
        </TouchableOpacity>
        {latestWeight && (
          <Text style={styles.userWeight}>
            {latestWeight.weight} {latestWeight.unit}
          </Text>
        )}
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FF6B6B20' }]}>
            <Dumbbell size={24} color="#FF6B6B" strokeWidth={2} />
          </View>
          <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#4ECDC420' }]}>
            <Activity size={24} color="#4ECDC4" strokeWidth={2} />
          </View>
          <Text style={styles.statValue}>{stats.totalCardioActivities}</Text>
          <Text style={styles.statLabel}>Cardio</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#95E1D320' }]}>
            <TrendingUp size={24} color="#95E1D3" strokeWidth={2} />
          </View>
          <Text style={styles.statValue}>{stats.totalDistanceFormatted}</Text>
          <Text style={styles.statLabel}>km Run</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FFD93D20' }]}>
            <Target size={24} color="#FFD93D" strokeWidth={2} />
          </View>
          <Text style={styles.statValue}>{stats.totalRoutines}</Text>
          <Text style={styles.statLabel}>Routines</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Summary</Text>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Sets</Text>
            <Text style={styles.summaryValue}>{stats.totalSets}</Text>
          </View>
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Reps</Text>
            <Text style={styles.summaryValue}>{stats.totalReps}</Text>
          </View>
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>This Week</Text>
            <Text style={styles.summaryValue}>{stats.recentWorkouts} workouts</Text>
          </View>
          {stats.weightChange !== 0 && (
            <>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Weight Change</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color:
                        stats.weightChange > 0 ? "#FF6B6B" : "#4ECDC4",
                    },
                  ]}
                >
                  {stats.weightChange > 0 ? "+" : ""}
                  {stats.weightChange.toFixed(1)} {latestWeight?.unit || "kg"}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nutrition Goals</Text>
        
        <View style={styles.goalsCard}>
          <View style={styles.goalRow}>
            <View style={styles.goalInfo}>
              <Flame size={20} color="#FF6B6B" strokeWidth={2} />
              <Text style={styles.goalLabel}>Calories</Text>
            </View>
            <Text style={styles.goalValue}>{goals.targetCalories} kcal</Text>
          </View>

          <View style={styles.goalRow}>
            <View style={styles.goalInfo}>
              <View style={[styles.macroIndicator, { backgroundColor: '#4ECDC4' }]} />
              <Text style={styles.goalLabel}>Protein</Text>
            </View>
            <Text style={styles.goalValue}>{goals.targetProtein}g</Text>
          </View>

          <View style={styles.goalRow}>
            <View style={styles.goalInfo}>
              <View style={[styles.macroIndicator, { backgroundColor: '#FFD93D' }]} />
              <Text style={styles.goalLabel}>Carbs</Text>
            </View>
            <Text style={styles.goalValue}>{goals.targetCarbs}g</Text>
          </View>

          <View style={styles.goalRow}>
            <View style={styles.goalInfo}>
              <View style={[styles.macroIndicator, { backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.goalLabel}>Fat</Text>
            </View>
            <Text style={styles.goalValue}>{goals.targetFat}g</Text>
          </View>

          <View style={styles.goalRow}>
            <View style={styles.goalInfo}>
              <View style={[styles.macroIndicator, { backgroundColor: '#95E1D3' }]} />
              <Text style={styles.goalLabel}>Water</Text>
            </View>
            <Text style={styles.goalValue}>{goals.waterGoal} glasses</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingsCard}>
          <TouchableOpacity 
            style={styles.settingsRow}
            onPress={() => router.push("/change-password" as any)}
          >
            <View style={styles.settingsInfo}>
              <View style={[styles.settingsIcon, { backgroundColor: '#4ECDC420' }]}>
                <Lock size={20} color="#4ECDC4" strokeWidth={2} />
              </View>
              <Text style={styles.settingsLabel}>Change Password</Text>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.settingsDivider} />

          <TouchableOpacity style={styles.settingsRow} onPress={handleLogout}>
            <View style={styles.settingsInfo}>
              <View style={[styles.settingsIcon, { backgroundColor: '#FF6B6B20' }]}>
                <LogOut size={20} color="#FF6B6B" strokeWidth={2} />
              </View>
              <Text style={[styles.settingsLabel, { color: '#FF6B6B' }]}>Log Out</Text>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeButton}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
                {editedPicture ? (
                  <Image source={{ uri: editedPicture }} style={styles.previewImage} contentFit="cover" />
                ) : (
                  <View style={styles.placeholderImage}>
                    <User size={48} color={Colors.textSecondary} strokeWidth={1.5} />
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Camera size={16} color="#FFF" strokeWidth={2.5} />
                </View>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.textSecondary}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.primaryAccent,
    marginBottom: 16,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },

  userWeight: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  summaryValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "600" as const,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  goalsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  goalLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500" as const,
  },
  goalValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "600" as const,
  },
  macroIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  achievementsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  achievementBadge: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 100,
  },
  achievementText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
    marginTop: 8,
    textAlign: "center",
  },
  noAchievements: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: "italic" as const,
    textAlign: "center" as const,
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  imagePickerContainer: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.cardBackground,
    borderWidth: 3,
    borderColor: Colors.primaryAccent,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primaryAccent,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.primaryAccent,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  settingsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
});
