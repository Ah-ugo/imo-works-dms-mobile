import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import axios from "axios";
import {
  Appbar,
  FAB,
  Portal,
  Modal,
  Button,
  TextInput,
  ActivityIndicator,
} from "react-native-paper";
import { Avatar, Card, SizableText, XStack, YStack } from "tamagui";
import RecentProjects from "@/components/homeComponents/RecentProjects";
import RecentFiles from "@/components/homeComponents/RecentFiles";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import CreateModal from "@/components/homeComponents/createModal";

const HomeScreen = () => {
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [authToken, setAuthToken] = useState();
  const [error, setError] = useState();
  const [userProfile, setUserProfile] = useState(null);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const [projectsRes, projectsListRes, documentsListRes, filesRes] =
        await Promise.all([
          axios.get(
            "https://imo-works-dms.onrender.com/api/projects/recent?limit=5",
            { headers: { Authorization: `Bearer ${authToken}` } }
          ),
          axios.get("https://imo-works-dms.onrender.com/api/projects/", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get("https://imo-works-dms.onrender.com/api/documents/", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get(
            "https://imo-works-dms.onrender.com/api/documents/recent?limit=5",
            { headers: { Authorization: `Bearer ${authToken}` } }
          ),
        ]);
      setRecentProjects(projectsRes.data);
      setTotalProjects(projectsListRes.data.length);
      setTotalDocuments(documentsListRes.data.length);
      setRecentFiles(filesRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, [authToken]);

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          "https://imo-works-dms.onrender.com/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    if (authToken) {
      fetchUserProfile();
    }
  }, [authToken]);

  // const fetchData = async () => {
  //   try {
  //     const projectsResponse = await axios.get(
  //       "https://imo-works-dms.onrender.com/api/projects/recent?limit=5",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${authToken}`,
  //         },
  //       }
  //     );
  //     setRecentProjects(projectsResponse.data);
  //     // setTotalProjects(projectsResponse.data.length);

  //     const projectsList = await axios.get(
  //       "https://imo-works-dms.onrender.com/api/projects/",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${authToken}`,
  //         },
  //       }
  //     );
  //     // setRecentProjects(projectsResponse.data);
  //     setTotalProjects(projectsList.data.length);

  //     const documentsList = await axios.get(
  //       "https://imo-works-dms.onrender.com/api/documents/",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${authToken}`,
  //         },
  //       }
  //     );
  //     // setRecentProjects(projectsResponse.data);
  //     setTotalDocuments(documentsList.data.length);

  //     const filesResponse = await axios.get(
  //       "https://imo-works-dms.onrender.com/api/documents/recent?limit=5",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${authToken}`,
  //         },
  //       }
  //     );
  //     setRecentFiles(filesResponse.data);
  //     // setTotalDocuments(filesResponse.data.length);
  //   } catch (error) {
  //     console.error("Error fetching data", error);
  //   }
  // };

  useEffect(() => {
    if (authToken) {
      fetchData();
    }
  }, [authToken]);

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
      fetchData();
      return response.data;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  };

  const handleUploadDocument = async (documentData) => {
    try {
      const formData = new FormData();
      // Add basic document data
      formData.append("title", documentData.title);
      formData.append("project_id", documentData.project_id);
      formData.append("reference_number", documentData.reference_number);
      formData.append("document_type", documentData.document_type);
      formData.append("description", documentData.description);

      // Add multiple files
      documentData.files.forEach((file) => {
        formData.append("files", file);
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
      fetchData();
      return response.data;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Appbar
        mode="large"
        style={{ paddingHorizontal: 20, backgroundColor: "#19572e" }}
      >
        <XStack
          alignItems="center"
          justifyContent="space-between"
          style={{ width: "100%", marginTop: -30 }}
        >
          <SizableText
            style={{ fontFamily: "PoppinsBold", fontSize: 18, color: "#fff" }}
          >
            Welcome, {userProfile?.first_name || "User"}
          </SizableText>
          <Avatar circular size="$4">
            <Avatar.Image
              accessibilityLabel={userProfile?.first_name || "User Avatar"}
              src={
                userProfile?.profile_image ||
                "https://t3.ftcdn.net/jpg/02/43/12/34/360_F_243123463_zTooub557xEWABDLk0jJklDyLSGl2jrr.jpg"
              }
            />
            <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
          </Avatar>
        </XStack>
      </Appbar>

      <View style={{ marginHorizontal: 20, marginTop: -50 }}>
        <XStack
          style={{ width: "100%" }}
          justifyContent="space-between"
          alignItems="center"
        >
          <Card
            style={{ width: "50%" }}
            elevate
            display="flex"
            justifyContent="center"
            alignItems="center"
            paddingHorizontal={20}
            paddingVertical={15}
            borderTopRightRadius={0}
            borderBottomRightRadius={0}
            borderTopLeftRadius={10}
            borderBottomLeftRadius={10}
          >
            <YStack justifyContent="center" alignItems="center" gap={10}>
              <View>
                <SizableText
                  style={{ fontSize: 15, fontFamily: "PoppinsSemiBold" }}
                >
                  Total Projects
                </SizableText>
              </View>
              <SizableText style={{ fontSize: 15, fontFamily: "PoppinsReg" }}>
                {totalProjects}
              </SizableText>
            </YStack>
          </Card>

          <Card
            style={{ width: "50%" }}
            elevate
            display="flex"
            justifyContent="center"
            alignItems="center"
            paddingHorizontal={20}
            paddingVertical={15}
            borderTopLeftRadius={0}
            borderBottomLeftRadius={0}
            borderTopRightRadius={10}
            borderBottomRightRadius={10}
          >
            <YStack justifyContent="center" alignItems="center" gap={10}>
              <View>
                <SizableText
                  style={{ fontSize: 15, fontFamily: "PoppinsSemiBold" }}
                >
                  Total Documents
                </SizableText>
              </View>
              <SizableText style={{ fontSize: 15, fontFamily: "PoppinsReg" }}>
                {totalDocuments}
              </SizableText>
            </YStack>
          </Card>
        </XStack>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#19572e" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Recent Projects Section */}
          <View style={{ marginBottom: 10 }}>
            <XStack
              marginHorizontal={20}
              marginTop={30}
              justifyContent="space-between"
              alignItems="center"
            >
              <SizableText style={{ fontFamily: "PoppinsMed", fontSize: 18 }}>
                Recent Projects
              </SizableText>
              <Link href="/allProjects">
                <SizableText style={{ fontFamily: "PoppinsReg", fontSize: 12 }}>
                  See all
                </SizableText>
              </Link>
            </XStack>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ paddingHorizontal: 20, marginTop: 20 }}
            >
              <XStack gap={10}>
                {recentProjects.map((project) => (
                  <RecentProjects key={project.id} project={project} />
                ))}
              </XStack>
            </ScrollView>
          </View>

          {/* Recent Files Section */}
          <View>
            <XStack
              marginHorizontal={20}
              marginTop={30}
              justifyContent="space-between"
              alignItems="center"
            >
              <SizableText style={{ fontFamily: "PoppinsMed", fontSize: 18 }}>
                Recent Files
              </SizableText>
              <Link href="/(main)/recentFiles">
                <SizableText style={{ fontFamily: "PoppinsReg", fontSize: 12 }}>
                  See all
                </SizableText>
              </Link>
            </XStack>
            <YStack marginTop={20} marginHorizontal={20} gap={20}>
              {recentFiles.map((file) => (
                <RecentFiles
                  key={file._id}
                  file={file}
                  refreshFiles={fetchData}
                />
              ))}
            </YStack>
          </View>
        </ScrollView>
      )}

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
    backgroundColor: "#fff",
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 8,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "PoppinsSemiBold",
    textAlign: "center",
  },
  modalButton: {
    borderRadius: 8,
  },
  fileSelected: {
    fontSize: 14,
    fontFamily: "PoppinsReg",
    color: "#666",
  },
});

export default HomeScreen;
