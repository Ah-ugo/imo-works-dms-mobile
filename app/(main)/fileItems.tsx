import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Appbar, FAB, Divider, ActivityIndicator } from "react-native-paper";
import { Avatar, Card, SizableText, XStack, YStack } from "tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { BlurView } from "expo-blur";
import * as WebBrowser from "expo-web-browser";
import CreateModal from "@/components/homeComponents/createModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width } = Dimensions.get("window");

const FileItemsScreen = () => {
  const { fileItems } = useLocalSearchParams();
  const parsedFileItems = JSON.parse(fileItems);
  const [error, setError] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [authToken, setAuthToken] = useState();
  const [userProfile, setUserProfile] = useState(null);

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

  const getToken = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (token) {
        setAuthToken(token);
      } else {
        setError("No token found. Please log in again.");
      }
    } catch (err) {
      setError("Failed to load token.");
      console.error("Error loading token:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getToken();
    setRefreshing(false);
  }, []);

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

  const getFileTypeColor = (extension) => {
    const colors = {
      pdf: "#FF5252",
      doc: "#2196F3",
      docx: "#2196F3",
      svg: "#9C27B0",
      jpg: "#4CAF50",
      jpeg: "#4CAF50",
      png: "#4CAF50",
      gif: "#4CAF50",
    };
    return colors[extension] || "#757575";
  };

  const getFileTypeIcon = (extension) => {
    const icons = {
      pdf: "picture-as-pdf",
      doc: "description",
      docx: "description",
      svg: "image",
      jpg: "image",
      jpeg: "image",
      png: "image",
      gif: "gif",
    };
    return icons[extension] || "insert-drive-file";
  };

  const renderFileItem = ({ item }) => {
    const fileExtension = item.name.split(".").pop().toLowerCase();
    const fileColor = getFileTypeColor(fileExtension);
    const fileIcon = getFileTypeIcon(fileExtension);

    return (
      <TouchableOpacity
        style={styles.fileItem}
        onPress={() => openFile(item.url)}
        activeOpacity={0.7}
      >
        <Card style={[styles.card, { borderLeftColor: fileColor }]} elevate>
          <XStack space={15} alignItems="center">
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${fileColor}15` },
              ]}
            >
              <MaterialIcons name={fileIcon} size={32} color={fileColor} />
            </View>
            <YStack flex={1}>
              <SizableText style={styles.fileName} numberOfLines={1}>
                {item.name}
              </SizableText>
              <SizableText style={styles.fileInfo}>
                {fileExtension.toUpperCase()} • {item.size || "Unknown size"}
              </SizableText>
            </YStack>
            <MaterialIcons name="chevron-right" size={24} color="#999" />
          </XStack>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header statusBarHeight={20} style={styles.appbar}>
        {/* <BlurView intensity={100} style={StyleSheet.absoluteFill} /> */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          style={styles.appbarContent}
        >
          <XStack alignItems="center" space={12}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <SizableText style={styles.appbarText}>My Files</SizableText>
          </XStack>
          <TouchableOpacity>
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
          </TouchableOpacity>
        </XStack>
      </Appbar.Header>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#19572e" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <YStack space={8} paddingHorizontal={16}>
            {parsedFileItems.map((item, index) => (
              <React.Fragment key={item.name}>
                {renderFileItem({ item })}
                {index < parsedFileItems.length - 1 && (
                  <Divider style={styles.divider} />
                )}
              </React.Fragment>
            ))}
          </YStack>
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  appbar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "rgba(25, 87, 46, 0.95)",
    elevation: 0,
  },
  appbarContent: {
    width: "100%",
    zIndex: 1,
  },
  appbarText: {
    fontFamily: "PoppinsBold",
    fontSize: 20,
    color: "#fff",
  },
  scrollContainer: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  fileItem: {
    width: "100%",
  },
  card: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  fileName: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    color: "#1A1A1A",
  },
  fileInfo: {
    fontSize: 13,
    fontFamily: "PoppinsReg",
    color: "#666",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: 8,
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FileItemsScreen;
