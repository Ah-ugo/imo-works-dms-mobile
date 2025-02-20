import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Card, SizableText, XStack, YStack } from "tamagui";
import { Appbar, Divider, FAB } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CreateModal from "@/components/homeComponents/createModal";

const { width } = Dimensions.get("window");

const AllProjectsScreen = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [authToken, setAuthToken] = useState();

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        "https://imo-works-dms.onrender.com/api/projects"
      );
      setProjects(response.data);
    } catch (err) {
      setError(err);
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const response = await axios.post(
        "https://imo-works-dms.onrender.com/api/projects/",
        projectData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      // fetchData();
      return response.data;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  };

  const handleUploadDocument = async (documentData) => {
    try {
      const formData = new FormData();
      Object.keys(documentData).forEach((key) => {
        formData.append(key, documentData[key]);
      });

      const response = await axios.post(
        "https://imo-works-dms.onrender.com/api/documents/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // fetchData();
      return response.data;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  };

  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          setAuthToken(token);
        } else {
          setError("No token found. Please log in again.");
        }
      } catch (err) {
        setError("Failed to load token.");
        console.error("Error loading token:", err);
      }
    };

    getToken();
  }, []);

  // useEffect(() => {
  //   const fetchProjects = async () => {
  //     try {
  //       const response = await axios.get(
  //         "https://imo-works-dms.onrender.com/api/projects"
  //       );
  //       setProjects(response.data);
  //     } catch (err) {
  //       setError(err);
  //       console.error("Error fetching projects:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchProjects();
  // }, []);

  const handleProjectPress = async (project) => {
    if (!project.id) {
      console.error("Project ID is missing");
      return;
    }

    router.push({
      pathname: "/projectDetails",
      params: {
        project: JSON.stringify(project),
      },
    });
  };

  const getRandomColor = (index) => {
    const colors = [
      "#4CAF50",
      "#2196F3",
      "#9C27B0",
      "#FF5252",
      "#FF9800",
      "#009688",
    ];
    return colors[index % colors.length];
  };

  const renderProjectItem = ({ item, index }) => {
    const color = getRandomColor(index);
    const initials = item.project_name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <TouchableOpacity
        onPress={() => handleProjectPress(item)}
        activeOpacity={0.7}
      >
        <Card style={styles.projectCard} elevate>
          <XStack space={16} alignItems="center">
            <View
              style={[
                styles.initialsContainer,
                { backgroundColor: `${color}15` },
              ]}
            >
              <SizableText style={[styles.initials, { color }]}>
                {initials}
              </SizableText>
            </View>
            <YStack flex={1} space={4}>
              <SizableText style={styles.projectName} numberOfLines={1}>
                {item.project_name}
              </SizableText>
              <XStack space={8} alignItems="center">
                <MaterialIcons name="schedule" size={16} color="#666" />
                <SizableText style={styles.dateText}>
                  {new Date(item.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </SizableText>
              </XStack>
            </YStack>
            <MaterialIcons name="chevron-right" size={24} color="#999" />
          </XStack>
        </Card>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#19572e" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={48} color="#FF5252" />
        <SizableText style={styles.errorText}>
          Error loading projects. Please try again.
        </SizableText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Appbar.Header statusBarHeight={20} style={styles.appbar}>
        {/* <BlurView intensity={100} style={StyleSheet.absoluteFill} /> */}
        <XStack alignItems="center" space={12}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <SizableText style={styles.appbarText}>All Projects</SizableText>
        </XStack>
      </Appbar.Header>

      <FlatList
        data={projects}
        renderItem={renderProjectItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <FAB
        icon="plus"
        label="Add"
        style={styles.fab}
        color="#fff"
        onPress={() => setModalVisible(true)}
      />

      <CreateModal
        visible={modalVisible}
        hideModal={() => setModalVisible(false)}
        onCreateProject={handleCreateProject}
        onUploadDocument={handleUploadDocument}
        authToken={authToken}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  appbar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "rgba(25, 87, 46, 0.95)",
    elevation: 0,
  },
  appbarText: {
    fontFamily: "PoppinsBold",
    fontSize: 20,
    color: "#fff",
  },
  listContainer: {
    padding: 16,
  },
  projectCard: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  initialsContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    fontSize: 18,
    fontFamily: "PoppinsSemiBold",
  },
  projectName: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    color: "#1A1A1A",
  },
  dateText: {
    fontSize: 13,
    fontFamily: "PoppinsReg",
    color: "#666",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: "PoppinsReg",
    color: "#666",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#19572e",
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});

export default AllProjectsScreen;
