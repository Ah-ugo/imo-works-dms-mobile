import { AntDesign, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Image, Input, SizableText, XStack, YStack } from "tamagui";

interface SignInProps {}

const SignIn = (props: SignInProps) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [emailFocused, setEmailFocused] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false); // Loading state
  const [error, setError] = React.useState(null); // Error state

  const handleSignIn = async () => {
    setIsLoading(true); // Set loading to true
    setError(null); // Clear any previous errors

    try {
      const response = await fetch(
        "https://imo-works-dms.onrender.com/api/auth/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            accept: "application/json", // Important: Add accept header
          },
          body: `grant_type=password&username=${email}&password=${password}`, // Use template literals
        }
      );

      if (!response.ok) {
        const errorData = await response.json(); // Attempt to parse JSON error
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData?.message || response.statusText
          }`
        );
      }

      const data = await response.json();

      // Store the token securely.  AsyncStorage is suitable for simple cases.
      await AsyncStorage.setItem("token", data.access_token); // Store access_token
      await AsyncStorage.setItem("userName", email); // Store user name (or whatever data you want)

      router.replace("/(main)/home"); // Redirect on successful login
    } catch (error) {
      console.error("Sign in error:", error);
      setError(error.message); // Set error message to display
    } finally {
      setIsLoading(false); // Set loading to false
    }
  };

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
          maxWidth={225}
        >
          <Text
            style={{
              fontSize: 25,
              color: "#076622",
              fontFamily: "PoppinsBold", // Make sure PoppinsBold is imported/available
              textAlign: "center",
            }}
          >
            Login here
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontFamily: "PoppinsMed", // Make sure PoppinsMed is imported/available
              textAlign: "center",
            }}
          >
            Welcome back you’ve been missed!
          </Text>
        </YStack>
      </XStack>

      <YStack marginHorizontal={20} gap={20} marginTop={40}>
        <Input
          borderWidth={emailFocused ? 1 : 0}
          placeholder="Email"
          borderColor={emailFocused ? "#076622" : "transparent"}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          onChangeText={setEmail} // Update email state
          value={email} // Set the input value from state
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
            style={{ paddingRight: 40 }}
            onChangeText={setPassword} // Update password state
            value={password} // Set the input value from state
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
        onPress={handleSignIn} // Call handleSignIn on press
        disabled={isLoading} // Disable button while loading
      >
        {isLoading ? ( // Show ActivityIndicator while loading
          <ActivityIndicator color="white" />
        ) : (
          <SizableText
            style={{
              fontSize: 15,
              fontFamily: "PoppinsSemiBold",
              color: "#fff",
            }}
          >
            Sign in
          </SizableText>
        )}
      </Button>

      {error && ( // Display error message if there is one
        <Text style={styles.errorText}>{error}</Text>
      )}
      <XStack justifyContent="center" alignItems="center" marginTop={30}>
        <Link
          // href={"/(auth)/signUp"}
          href={"/(main)/comingSoon"}
        >
          <SizableText
            style={{
              fontFamily: "PoppinsSemiBold",
              fontSize: 14,
              color: "#494949",
            }}
          >
            Create new account
          </SizableText>
        </Link>
      </XStack>
    </SafeAreaView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20, // Consider removing or adjusting marginTop based on your needs
    backgroundColor: "#fff",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});
