import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Card, SizableText, YStack, XStack } from "tamagui";
import React, { useState, useEffect, useCallback } from "react";
import { Appbar, Divider, FAB } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import axios from "axios";
import * as WebBrowser from "expo-web-browser";
import CreateModal from "@/components/homeComponents/createModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const ProjectDetailsScreen = () => {
  const params = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [authToken, setAuthToken] = useState();

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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (typeof params.project === "string") {
        const parsedProject = JSON.parse(params.project);
        setProject(parsedProject);

        const response = await axios.get(
          `https://imo-works-dms.onrender.com/api/projects/${parsedProject.id}/documents`
        );

        if (response.data) {
          setDocuments(response.data);
        } else {
          setError("No documents found for this project.");
        }
      } else {
        setError("Invalid project data.");
      }
    } catch (err) {
      console.error("Error loading project data:", err);
      setError("Failed to load project data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    fetchData();
  }, [params.project]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  // useEffect(() => {
  //   const getToken = async () => {
  //     try {
  //       const token = await AsyncStorage.getItem("token");
  //       if (token) {
  //         setAuthToken(token);
  //       } else {
  //         setError("No token found. Please log in again.");
  //       }
  //     } catch (err) {
  //       setError("Failed to load token.");
  //       console.error("Error loading token:", err);
  //     }
  //   };

  //   getToken();
  // }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (typeof params.project === "string") {
          const parsedProject = JSON.parse(params.project);
          setProject(parsedProject);

          const response = await axios.get(
            `https://imo-works-dms.onrender.com/api/projects/${parsedProject.id}/documents`
          );

          if (response.data) {
            setDocuments(response.data);
          } else {
            setError("No documents found for this project.");
          }
        } else {
          setError("Invalid project data.");
        }
      } catch (err) {
        console.error("Error loading project data:", err);
        setError("Failed to load project data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.project]);

  const openFile = async (url) => {
    if (!url) {
      alert("Invalid file URL");
      return;
    }

    try {
      if (Platform.OS === "web") {
        window.open(url, "_blank");
      } else {
        await WebBrowser.openBrowserAsync(url);
      }
    } catch (error) {
      console.error("Error opening file:", error);
      alert("Could not open the file. Please try again.");
    }
  };

  const getFileTypeInfo = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();
    const types = {
      pdf: { color: "#FF5252", icon: "picture-as-pdf" },
      doc: { color: "#2196F3", icon: "description" },
      docx: { color: "#2196F3", icon: "description" },
      jpg: { color: "#4CAF50", icon: "image" },
      jpeg: { color: "#4CAF50", icon: "image" },
      png: { color: "#4CAF50", icon: "image" },
      gif: { color: "#4CAF50", icon: "gif" },
    };
    return types[extension] || { color: "#757575", icon: "insert-drive-file" };
  };

  const renderFileItem = ({ item }) => {
    const { color, icon } = getFileTypeInfo(item.name);

    return (
      <TouchableOpacity
        onPress={() => openFile(item.url)}
        style={[styles.fileContainer, { backgroundColor: `${color}15` }]}
        activeOpacity={0.7}
      >
        <MaterialIcons name={icon} size={24} color={color} />
        <SizableText style={styles.fileText} numberOfLines={1}>
          {item.name}
        </SizableText>
      </TouchableOpacity>
    );
  };

  const renderDocumentItem = ({ item, index }) => (
    <Card style={styles.documentCard} elevate>
      <YStack space={12}>
        <XStack space={12} alignItems="center">
          <MaterialIcons name="article" size={24} color="#19572e" />
          <SizableText style={styles.documentTitle} numberOfLines={2}>
            {item.title}
          </SizableText>
        </XStack>

        {item.description && (
          <>
            <Divider style={styles.divider} />
            <SizableText style={styles.description}>
              {item.description}
            </SizableText>
          </>
        )}

        {item.file_items?.length > 0 && (
          <>
            <Divider style={styles.divider} />
            <FlatList
              data={item.file_items}
              renderItem={renderFileItem}
              keyExtractor={(file, idx) => `${file.name}-${idx}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filesList}
            />
          </>
        )}
      </YStack>
    </Card>
  );

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
        <SizableText style={styles.errorText}>{error}</SizableText>
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
          <SizableText style={styles.appbarText} numberOfLines={1}>
            {project?.project_name}
          </SizableText>
        </XStack>
      </Appbar.Header>

      <View style={styles.content}>
        <Card style={styles.projectCard} elevate>
          <YStack space={8}>
            <XStack space={12} alignItems="center">
              <MaterialIcons name="folder" size={24} color="#19572e" />
              <SizableText style={styles.projectName}>
                {project?.project_name}
              </SizableText>
            </XStack>
            {project?.description && (
              <SizableText style={styles.projectDescription}>
                {project.description}
              </SizableText>
            )}
          </YStack>
        </Card>

        <FlatList
          data={documents}
          renderItem={renderDocumentItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.documentsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>

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
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  projectCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  projectName: {
    fontSize: 18,
    fontFamily: "PoppinsSemiBold",
    color: "#1A1A1A",
    flex: 1,
  },
  projectDescription: {
    fontSize: 14,
    fontFamily: "PoppinsReg",
    color: "#666",
    marginTop: 4,
  },
  documentCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  documentTitle: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    color: "#1A1A1A",
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontFamily: "PoppinsReg",
    color: "#666",
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    maxWidth: width * 0.6,
  },
  fileText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "PoppinsReg",
    color: "#333",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  documentsList: {
    flexGrow: 1,
  },
  filesList: {
    paddingVertical: 4,
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

export default ProjectDetailsScreen;
