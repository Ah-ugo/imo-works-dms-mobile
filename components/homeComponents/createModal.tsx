import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Modal,
  Portal,
  Button,
  TextInput,
  Text,
  List,
  Searchbar,
  ActivityIndicator,
} from "react-native-paper";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import { showMessage } from "react-native-flash-message";

const CreateModal = ({
  visible,
  hideModal,
  onCreateProject,
  onUploadDocument,
  authToken,
  documentId,
  onSuccess,
}: any) => {
  const [mode, setMode] = useState("select");
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [showProjectList, setShowProjectList] = useState(false);
  const [showDocumentList, setShowDocumentList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] = useState({
    project_name: "",
    description: "",
  });
  const [documentData, setDocumentData] = useState({
    title: "",
    project_id: "",
    project_name: "",
    reference_number: "",
    document_type: "",
    description: "",
    files: [],
  });
  const [replyData, setReplyData] = useState({
    title: "",
    files: [],
    document_id: "",
    document_title: "",
  });

  useEffect(() => {
    if (visible) {
      fetchProjects();
    }
  }, [visible, authToken]);

  useEffect(() => {
    if (visible && mode === "reply") {
      fetchDocuments();
    }
  }, [visible, mode, authToken]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        "https://imo-works-dms.onrender.com/api/projects",
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setProjects(response.data);
    } catch (error) {
      showMessage({
        message: "Error fetching projects",
        type: "danger",
      });
      console.error("Error fetching projects:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        "https://imo-works-dms.onrender.com/api/documents",
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setDocuments(response.data);
    } catch (error) {
      showMessage({
        message: "Error fetching documents",
        type: "danger",
      });
      console.error("Error fetching documents:", error);
    }
  };

  const handleProjectCreate = async () => {
    setIsLoading(true);
    try {
      await onCreateProject(projectData);
      showMessage({
        message: "Project created successfully",
        type: "success",
      });
      if (onSuccess) {
        await onSuccess();
      }
      resetAndClose();
    } catch (error) {
      showMessage({
        message: "Error creating project",
        type: "danger",
      });
      console.error("Error creating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentPick = async (isReply = false) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.assets) {
        const files = result.assets.map((asset) => ({
          uri: asset.uri,
          type: asset.mimeType,
          name: asset.name,
        }));

        if (isReply) {
          setReplyData((prev) => ({
            ...prev,
            files: [...prev.files, ...files],
          }));
        } else {
          setDocumentData((prev) => ({
            ...prev,
            files: [...prev.files, ...files],
          }));
        }
      }
    } catch (error) {
      showMessage({
        message: "Error selecting files",
        type: "danger",
      });
      console.error("Error picking document:", error);
    }
  };

  const handleDocumentUpload = async () => {
    setIsLoading(true);
    try {
      await onUploadDocument(documentData);
      showMessage({
        message: "Document uploaded successfully",
        type: "success",
      });
      if (onSuccess) {
        await onSuccess();
      }
      resetAndClose();
    } catch (error) {
      showMessage({
        message: "Error uploading document",
        type: "danger",
      });
      console.error("Error uploading document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", replyData.title);
      replyData.files.forEach((file) => {
        formData.append(`files`, file);
      });

      await axios.post(
        `https://imo-works-dms.onrender.com/api/documents/${replyData.document_id}/reply`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showMessage({
        message: "Reply added successfully",
        type: "success",
      });
      if (onSuccess) {
        await onSuccess();
      }
      resetAndClose();
    } catch (error) {
      showMessage({
        message: "Error sending reply",
        type: "danger",
      });
      console.error("Error sending reply:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    hideModal();
    setMode("select");
    setProjectData({ project_name: "", description: "" });
    setDocumentData({
      title: "",
      project_id: "",
      project_name: "",
      reference_number: "",
      document_type: "",
      description: "",
      files: [],
    });
    setReplyData({
      title: "",
      files: [],
      document_id: "",
      document_title: "",
    });
    setSearchQuery("");
    setShowProjectList(false);
    setShowDocumentList(false);
  };

  const renderFileList = (files, onRemove) => (
    <View style={styles.fileList}>
      {files.map((file, index) => (
        <View key={index} style={styles.fileItem}>
          <Text style={styles.fileName}>{file.name}</Text>
          <Button
            mode="text"
            onPress={() => onRemove(index)}
            textColor="red"
            disabled={isLoading}
          >
            Remove
          </Button>
        </View>
      ))}
    </View>
  );

  const renderDocumentList = () => (
    <View style={styles.listContainer}>
      <Searchbar
        placeholder="Search documents..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <ScrollView style={styles.list}>
        {documents
          .filter((doc) =>
            doc.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((doc) => (
            <List.Item
              key={doc._id}
              title={doc.title}
              description={`Reference: ${doc.reference_number}`}
              onPress={() => {
                setReplyData((prev) => ({
                  ...prev,
                  document_id: doc._id,
                  document_title: doc.title,
                }));
                setShowDocumentList(false);
                setSearchQuery("");
              }}
              style={styles.listItem}
            />
          ))}
      </ScrollView>
    </View>
  );

  const renderProjectList = () => (
    <View style={styles.listContainer}>
      <ScrollView style={styles.list}>
        {projects.map((project) => (
          <List.Item
            key={project.id}
            title={project.project_name}
            description={project.description}
            onPress={() => {
              setDocumentData((prev) => ({
                ...prev,
                project_id: project.id,
                project_name: project.project_name,
              }));
              setShowProjectList(false);
            }}
            style={styles.listItem}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderContent = () => {
    switch (mode) {
      case "select":
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.modalTitle}>What would you like to do?</Text>
            <Button
              mode="contained"
              onPress={() => setMode("project")}
              style={styles.modalButton}
              buttonColor="#19572e"
              disabled={isLoading}
            >
              New Project
            </Button>
            <Button
              mode="contained"
              onPress={() => setMode("document")}
              style={styles.modalButton}
              buttonColor="#19572e"
              disabled={isLoading}
            >
              Upload Document
            </Button>
            <Button
              mode="contained"
              onPress={() => setMode("reply")}
              style={styles.modalButton}
              buttonColor="#19572e"
              disabled={isLoading}
            >
              Reply to Document
            </Button>
          </View>
        );

      case "reply":
        return (
          <ScrollView>
            <View style={styles.contentContainer}>
              <Text style={styles.modalTitle}>Reply to Document</Text>
              <TextInput
                label="Select Document"
                value={replyData.document_title}
                onFocus={() => setShowDocumentList(true)}
                mode="outlined"
                style={styles.input}
                disabled={isLoading}
              />
              {showDocumentList && renderDocumentList()}
              <TextInput
                label="Reply Title"
                value={replyData.title}
                onChangeText={(text) =>
                  setReplyData((prev) => ({ ...prev, title: text }))
                }
                mode="outlined"
                style={styles.input}
                disabled={!replyData.document_id || isLoading}
              />
              <Button
                mode="contained"
                onPress={() => handleDocumentPick(true)}
                style={styles.modalButton}
                buttonColor="#19572e"
                disabled={!replyData.document_id || isLoading}
              >
                Select Files
              </Button>
              {replyData.files.length > 0 &&
                renderFileList(replyData.files, (index) =>
                  setReplyData((prev) => ({
                    ...prev,
                    files: prev.files.filter((_, i) => i !== index),
                  }))
                )}
              <View style={styles.buttonRow}>
                <Button
                  mode="contained"
                  onPress={handleReply}
                  style={[styles.modalButton, styles.buttonFlex]}
                  buttonColor="#19572e"
                  disabled={
                    isLoading ||
                    !replyData.document_id ||
                    !replyData.title ||
                    replyData.files.length === 0
                  }
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size={20} />
                  ) : (
                    "Send Reply"
                  )}
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setMode("select");
                    setReplyData({
                      title: "",
                      files: [],
                      document_id: "",
                      document_title: "",
                    });
                    setSearchQuery("");
                  }}
                  style={[styles.modalButton, styles.buttonFlex]}
                  textColor="#19572e"
                  disabled={isLoading}
                >
                  Back
                </Button>
              </View>
            </View>
          </ScrollView>
        );

      case "project":
        return (
          <ScrollView>
            <View style={styles.contentContainer}>
              <Text style={styles.modalTitle}>Create New Project</Text>
              <TextInput
                label="Project Name"
                value={projectData.project_name}
                onChangeText={(text) =>
                  setProjectData((prev) => ({ ...prev, project_name: text }))
                }
                mode="outlined"
                style={styles.input}
                disabled={isLoading}
              />
              <TextInput
                label="Description"
                value={projectData.description}
                onChangeText={(text) =>
                  setProjectData((prev) => ({ ...prev, description: text }))
                }
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
                disabled={isLoading}
              />
              <View style={styles.buttonRow}>
                <Button
                  mode="contained"
                  onPress={handleProjectCreate}
                  style={[styles.modalButton, styles.buttonFlex]}
                  buttonColor="#19572e"
                  disabled={isLoading || !projectData.project_name}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size={20} />
                  ) : (
                    "Create Project"
                  )}
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => setMode("select")}
                  style={[styles.modalButton, styles.buttonFlex]}
                  textColor="#19572e"
                  disabled={isLoading}
                >
                  Back
                </Button>
              </View>
            </View>
          </ScrollView>
        );

      case "document":
        return (
          <ScrollView>
            <View style={styles.contentContainer}>
              <Text style={styles.modalTitle}>Upload Document</Text>
              <TextInput
                label="Title"
                value={documentData.title}
                onChangeText={(text) =>
                  setDocumentData((prev) => ({ ...prev, title: text }))
                }
                mode="outlined"
                style={styles.input}
                disabled={isLoading}
              />
              <TextInput
                label="Project"
                value={documentData.project_name}
                onFocus={() => setShowProjectList(true)}
                mode="outlined"
                style={styles.input}
                disabled={isLoading}
              />
              {showProjectList && renderProjectList()}
              <TextInput
                label="Reference Number"
                value={documentData.reference_number}
                onChangeText={(text) =>
                  setDocumentData((prev) => ({
                    ...prev,
                    reference_number: text,
                  }))
                }
                mode="outlined"
                style={styles.input}
                disabled={isLoading}
              />
              <TextInput
                label="Document Type"
                value={documentData.document_type}
                onChangeText={(text) =>
                  setDocumentData((prev) => ({ ...prev, document_type: text }))
                }
                mode="outlined"
                style={styles.input}
                disabled={isLoading}
              />
              <TextInput
                label="Description"
                label="Description"
                value={documentData.description}
                onChangeText={(text) =>
                  setDocumentData((prev) => ({ ...prev, description: text }))
                }
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
                disabled={isLoading}
              />
              <Button
                mode="contained"
                onPress={() => handleDocumentPick(false)}
                style={styles.modalButton}
                buttonColor="#19572e"
                disabled={isLoading}
              >
                Select Files
              </Button>
              {documentData.files.length > 0 &&
                renderFileList(documentData.files, (index) =>
                  setDocumentData((prev) => ({
                    ...prev,
                    files: prev.files.filter((_, i) => i !== index),
                  }))
                )}
              <View style={styles.buttonRow}>
                <Button
                  mode="contained"
                  onPress={handleDocumentUpload}
                  style={[styles.modalButton, styles.buttonFlex]}
                  buttonColor="#19572e"
                  disabled={
                    isLoading ||
                    !documentData.files.length ||
                    !documentData.title ||
                    !documentData.project_id
                  }
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size={20} />
                  ) : (
                    "Upload Document"
                  )}
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => setMode("select")}
                  style={[styles.modalButton, styles.buttonFlex]}
                  textColor="#19572e"
                  disabled={isLoading}
                >
                  Back
                </Button>
              </View>
            </View>
          </ScrollView>
        );
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={resetAndClose}
        contentContainerStyle={styles.modalContainer}
      >
        {renderContent()}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 8,
    maxHeight: "80%",
  },
  contentContainer: {
    padding: 20,
    gap: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "PoppinsSemiBold",
    textAlign: "center",
    marginBottom: 10,
  },
  modalButton: {
    borderRadius: 8,
    marginVertical: 5,
  },
  listContainer: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginTop: -15,
  },
  list: {
    maxHeight: 250,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchbar: {
    margin: 4,
    elevation: 0,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  buttonFlex: {
    flex: 1,
  },
  input: {
    marginVertical: 5,
  },
  fileList: {
    marginTop: 10,
  },
  fileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    marginBottom: 5,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "PoppinsReg",
  },
});

export default CreateModal;
