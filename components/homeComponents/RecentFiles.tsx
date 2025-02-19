import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { SizableText, XStack, YStack } from "tamagui";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Popover, Button } from "tamagui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";

export default function RecentFiles({ file, refreshFiles }: any) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (documentId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication token not found.");
        return;
      }

      setLoading(true);
      await axios.delete(
        `https://imo-works-dms.onrender.com/api/documents/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      Alert.alert("Success", "Document deleted successfully.");
      refreshFiles();
    } catch (error) {
      Alert.alert("Error", "Failed to delete the document.");
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (documentId: string) => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Delete", onPress: () => handleDelete(documentId) },
      ]
    );
  };

  function formatDate(dateString: string) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
  }

  const truncateProjectName = (name: string, maxLength: number = 25) => {
    return name.length > maxLength
      ? name.substring(0, maxLength) + "..."
      : name;
  };

  const navigateToFileItems = (fileItems: any) => {
    router.push({
      pathname: "/fileItems", // Path to the new screen
      params: { fileItems: JSON.stringify(fileItems) }, // Pass file items as JSON string
    });
  };

  return (
    <Pressable onPress={() => navigateToFileItems(file.file_items)}>
      <View style={{ paddingVertical: 10 }}>
        <XStack justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" gap={15}>
            <AntDesign name="file1" size={50} color="#19572e" />

            <YStack>
              <SizableText
                style={{
                  fontSize: 12,
                  fontFamily: "PoppinsMed",
                  color: "#273043",
                }}
              >
                {truncateProjectName(file.title)}
              </SizableText>
              <SizableText
                style={{
                  fontSize: 10,
                  fontFamily: "PoppinsMed",
                  color: "#273043",
                }}
              >
                {formatDate(file.created_at)}
              </SizableText>
            </YStack>
          </XStack>

          {/* Popover for delete menu */}
          <Popover size="$5" allowFlip stayInFrame offset={10}>
            <Popover.Trigger asChild>
              <Pressable>
                <Feather name="more-vertical" size={24} color="#363853" />
              </Pressable>
            </Popover.Trigger>

            <Popover.Content
              borderWidth={1}
              borderColor="$borderColor"
              width={150}
              padding="$2"
              backgroundColor="white"
              borderRadius="$3"
              shadowColor="black"
              shadowRadius="$2"
              enterStyle={{ opacity: 0, transform: [{ translateY: -10 }] }}
              exitStyle={{ opacity: 0, transform: [{ translateY: -10 }] }}
              elevate
              animation={[
                "quick",
                {
                  opacity: { overshootClamping: true },
                },
              ]}
            >
              <Popover.Arrow borderWidth={1} borderColor="$borderColor" />

              <YStack alignItems="center">
                <Button
                  size="$3"
                  backgroundColor="red"
                  color="white"
                  disabled={loading}
                  onPress={() => confirmDelete(file._id)}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </YStack>
            </Popover.Content>
          </Popover>
        </XStack>
      </View>
    </Pressable>
  );
}
