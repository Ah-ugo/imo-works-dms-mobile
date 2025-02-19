import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import * as React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Image, Input, SizableText, XStack, YStack } from "tamagui";

interface SignUpProps {}

const SignUp = (props: SignUpProps) => {
  const [emailFocused, setEmailFocused] = React.useState(false);
  const [firstFocused, setfirstFocused] = React.useState(false);
  const [lastFocused, setlastFocused] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <XStack justifyContent="center" alignItems="center">
        <Image
          borderRadius={50}
          source={require("../../assets/images/works_logo.jpg")} // Fixed: Removed width and height from source
          style={{ width: 200, height: 200 }} // Added width and height as style
        />
      </XStack>
      <XStack justifyContent="center" alignItems="center" marginTop={20}>
        <YStack
          justifyContent="center"
          alignItems="center"
          gap={10}
          maxWidth={350}
        >
          <Text
            style={{
              fontSize: 25,
              color: "#076622",
              fontFamily: "PoppinsBold", // Make sure PoppinsBold is imported/available
              textAlign: "center",
            }}
          >
            Create Account
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontFamily: "PoppinsMed", // Make sure PoppinsMed is imported/available
              textAlign: "center",
            }}
          >
            Create an account so you can explore all the existing jobs
          </Text>
        </YStack>
      </XStack>

      <YStack marginHorizontal={20} gap={20} marginTop={40}>
        <Input
          borderWidth={firstFocused ? 1 : 0}
          placeholder="First name"
          borderColor={firstFocused ? "#076622" : "transparent"}
          onFocus={() => setfirstFocused(true)}
          onBlur={() => setfirstFocused(false)}
        />
        <Input
          borderWidth={lastFocused ? 1 : 0}
          placeholder="Last name"
          borderColor={lastFocused ? "#076622" : "transparent"}
          onFocus={() => setlastFocused(true)}
          onBlur={() => setlastFocused(false)}
        />
        <Input
          borderWidth={emailFocused ? 1 : 0}
          placeholder="Email"
          borderColor={emailFocused ? "#076622" : "transparent"}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />

        <View>
          {/* Wrap Input and TouchableOpacity in a View */}
          <Input
            borderWidth={passwordFocused ? 1 : 0}
            placeholder="Password"
            borderColor={passwordFocused ? "#076622" : "transparent"}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            secureTextEntry={!isPasswordVisible}
            style={{ paddingRight: 40 }} // Add padding to the Input
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={{ position: "absolute", right: 10, top: 12 }} // Position the icon
          >
            {/* <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={24}
              color="gray"
            /> */}

            <Ionicons
              name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
              size={24}
              color="#494949"
            />
          </TouchableOpacity>
        </View>
      </YStack>

      <Button
        marginHorizontal={20}
        marginTop={40}
        backgroundColor={"#076622"}
        color={"white"}
        // fontSize={15}
      >
        <SizableText
          style={{
            fontSize: 15,
            fontFamily: "PoppinsSemiBold",
            color: "#fff",
            //   fontWeight: "bold",
          }}
        >
          Sign up
        </SizableText>
      </Button>
      <XStack justifyContent="center" alignItems="center" marginTop={30}>
        <Link href={"/(auth)/signIn"}>
          <SizableText
            style={{
              fontFamily: "PoppinsSemiBold",
              fontSize: 14,
              color: "#494949",
            }}
          >
            Already have an account
          </SizableText>
        </Link>
      </XStack>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20, // Consider removing or adjusting marginTop based on your needs
    backgroundColor: "#fff",
  },
});
