import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { Appbar, Divider, FAB } from "react-native-paper";
import { SizableText, XStack, YStack, Card } from "tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import CreateModal from "@/components/homeComponents/createModal";

const { width } = Dimensions.get("window");

const RecentFilesScreen = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const loadFiles = async () => {
      if (!authToken) return;

      try {
        const response = await axios.get(
          "https://imo-works-dms.onrender.com/api/documents/recent?limit=500",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        setFiles(response.data);
      } catch (err) {
        setError("Failed to load recent files.");
        console.error("Error fetching files:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [authToken]);

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

  const getFileTypeColor = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();
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

  const getFileTypeIcon = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();
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

  const renderFileItem = ({ item: fileItem }) => (
    <TouchableOpacity
      style={styles.fileItem}
      onPress={() => openFile(fileItem.url)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.fileContainer,
          { backgroundColor: `${getFileTypeColor(fileItem.name)}15` },
        ]}
      >
        <MaterialIcons
          name={getFileTypeIcon(fileItem.name)}
          size={24}
          color={getFileTypeColor(fileItem.name)}
        />
        <SizableText style={styles.fileText} numberOfLines={1}>
          {fileItem.name}
        </SizableText>
      </View>
    </TouchableOpacity>
  );

  const renderDocumentCard = ({ item }) => {
    const fileItems = item?.file_items || [];

    return (
      <Card style={styles.documentCard} elevate>
        <YStack space={12}>
          <XStack alignItems="center" space={8}>
            <MaterialIcons name="folder" size={24} color="#19572e" />
            <SizableText style={styles.title} numberOfLines={2}>
              {item?.title}
            </SizableText>
          </XStack>
          <Divider style={styles.divider} />
          <FlatList
            data={fileItems}
            horizontal
            renderItem={renderFileItem}
            keyExtractor={(fileItem) => fileItem?.name}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filesContainer}
          />
        </YStack>
      </Card>
    );
  };

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
          <SizableText style={styles.appbarText}>All Documents</SizableText>
        </XStack>
      </Appbar.Header>

      <FlatList
        data={files}
        renderItem={renderDocumentCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.documentList}
        showsVerticalScrollIndicator={false}
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
  documentList: {
    padding: 16,
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
  title: {
    fontSize: 18,
    fontFamily: "PoppinsSemiBold",
    color: "#1A1A1A",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  filesContainer: {
    paddingVertical: 8,
  },
  fileItem: {
    marginRight: 12,
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    maxWidth: width * 0.6,
  },
  fileText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "PoppinsReg",
    color: "#333",
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

export default RecentFilesScreen;
