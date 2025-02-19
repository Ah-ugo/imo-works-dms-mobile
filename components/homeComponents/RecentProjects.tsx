import { View, Text } from "react-native";
import React from "react";
import { Card, SizableText, YStack } from "tamagui";
import FolderIcon from "@/assets/icons/folder-icon";
import { useRouter } from "expo-router";

export default function RecentProjects({ project }: any) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/(main)/projectDetails",
      params: {
        project: JSON.stringify(project),
      },
    });
  };

  function formatDate(dateString: any) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);

    return `${month}/${day}/${year}`;
  }

  const truncateProjectName = (name: string, maxLength: number = 12) => {
    if (name.length > maxLength) {
      return name.substring(0, maxLength) + "...";
    }
    return name;
  };

  return (
    <Card
      onPress={handlePress}
      animation="bouncy"
      maxWidth={140}
      maxHeight={140}
      minWidth={140}
      minHeight={140}
      paddingHorizontal={10}
      paddingVertical={15}
      scale={0.9}
      borderRadius={30}
      hoverStyle={{ scale: 0.925 }}
      pressStyle={{ scale: 0.875 }}
      backgroundColor={"white"}
    >
      <YStack gap={15}>
        <View
          style={{
            backgroundColor: "#F1F5FE",
            minWidth: 50,
            minHeight: 50,
            maxHeight: 50,
            maxWidth: 50,
            borderRadius: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FolderIcon />
        </View>

        <View>
          <SizableText style={{ fontSize: 12, fontFamily: "PoppinsMed" }}>
            {truncateProjectName(project.project_name)}
          </SizableText>

          <SizableText
            style={{ fontSize: 10, fontFamily: "PoppinsMed", color: "#494949" }}
          >
            {formatDate(project.created_at)}
          </SizableText>
        </View>
      </YStack>
    </Card>
  );
}
