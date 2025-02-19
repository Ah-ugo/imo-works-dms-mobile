import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const RegisterComingSoonScreen = () => {
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Fade in and slide up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNotifyMePress = () => {
    Alert.alert(
      "Stay Updated",
      "Would you like to be notified when registration opens?",
      [
        {
          text: "Yes, notify me",
          onPress: () =>
            Alert.alert(
              "Success!",
              "We'll notify you as soon as registration opens."
            ),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const handleWebsitePress = () => {
    Linking.openURL("https://imostateministryofworks.vercel.app/");
  };

  // Animated container for content
  const AnimatedContent = Animated.createAnimatedComponent(View);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/works_logo.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={3}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.8)"]}
          style={styles.overlay}
        >
          <AnimatedContent
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>IW</Text>
            </View>

            <Text style={styles.title}>Imo Works</Text>
            <Text style={styles.subtitle}>Registration Coming Soon</Text>

            <View style={styles.card}>
              <Text style={styles.description}>
                Get ready to access Imo State Ministry of Works project files.
                Be among the first to know when we launch!
              </Text>
            </View>

            <TouchableOpacity
              style={styles.notifyButton}
              onPress={handleNotifyMePress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#19572e", "#19572e"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.notifyButtonText}>Notify Me</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleWebsitePress}
              style={styles.websiteLinkContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.websiteLink}>Visit our website</Text>
            </TouchableOpacity>
          </AnimatedContent>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  logo: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
    fontFamily: "PoppinsBold",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
    fontFamily: "PoppinsBold",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 24,
    color: "#E0E0E0",
    marginBottom: 32,
    fontFamily: "PoppinsSemiBold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  description: {
    fontSize: 18,
    color: "#F5F5F5",
    textAlign: "center",
    fontFamily: "PoppinsReg",
    lineHeight: 26,
  },
  notifyButton: {
    width: "100%",
    maxWidth: 300,
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#1D5BC2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  notifyButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "PoppinsSemiBold",
  },
  websiteLinkContainer: {
    padding: 12,
  },
  websiteLink: {
    color: "#E0E0E0",
    fontSize: 16,
    textDecorationLine: "underline",
    fontFamily: "PoppinsReg",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default RegisterComingSoonScreen;
