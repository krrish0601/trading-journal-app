import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImagesSelected: (imageUris: string[]) => void;
}

export function ImagePickerModal({
  visible,
  onClose,
  onImagesSelected,
}: ImagePickerModalProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      setIsLoading(true);

      // Request permissions for media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need permission to access your photo library"
        );
        setIsLoading(false);
        return;
      }

      // Launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImages([...selectedImages, imageUri]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setIsLoading(true);

      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need permission to access your camera"
        );
        setIsLoading(false);
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImages([...selectedImages, imageUri]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = (uri: string) => {
    setSelectedImages(selectedImages.filter((img) => img !== uri));
  };

  const handleConfirm = () => {
    if (selectedImages.length === 0) {
      Alert.alert("Error", "Please select at least one image");
      return;
    }
    onImagesSelected(selectedImages);
    setSelectedImages([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-background p-4 pt-12">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-foreground">
            Add Trade Screenshots
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-primary font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={handlePickImage}
            disabled={isLoading}
            className={`flex-1 ${
              isLoading ? "bg-primary/50" : "bg-primary"
            } py-3 rounded-lg items-center`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-background font-semibold">📁 Gallery</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleTakePhoto}
            disabled={isLoading}
            className={`flex-1 ${
              isLoading ? "bg-primary/50" : "bg-primary"
            } py-3 rounded-lg items-center`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-background font-semibold">📷 Camera</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info Text */}
        <View className="bg-surface/50 border border-border rounded-lg p-3 mb-6">
          <Text className="text-xs text-muted">
            {Platform.OS === "web"
              ? "📝 On web: Image upload is not available. Use the mobile app (iOS/Android) to capture and upload trade screenshots."
              : "📝 Select images from your device gallery or take a new photo with your camera."}
          </Text>
        </View>

        {/* Selected Images */}
        {selectedImages.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">
              Selected Images ({selectedImages.length})
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {selectedImages.map((uri, index) => (
                <View key={index} className="mr-3 relative">
                  <Image
                    source={{ uri }}
                    style={{ width: 100, height: 100 }}
                    className="rounded-lg"
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(uri)}
                    className="absolute top-1 right-1 bg-error rounded-full w-6 h-6 items-center justify-center"
                  >
                    <Text className="text-background text-xs font-bold">✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Confirm Button */}
        <View className="flex-row gap-3 mt-auto mb-6">
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 bg-surface border border-border py-3 rounded-lg items-center"
          >
            <Text className="text-foreground font-semibold">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={selectedImages.length === 0 || isLoading}
            className={`flex-1 py-3 rounded-lg items-center ${
              selectedImages.length === 0 || isLoading
                ? "bg-primary/50"
                : "bg-primary"
            }`}
          >
            <Text className="text-background font-semibold">
              Add {selectedImages.length} Image{selectedImages.length !== 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
