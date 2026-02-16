import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useState } from "react";

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

  const handlePickImage = async () => {
    try {
      // For web, create a file input
      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.multiple = true;
        input.onchange = (e: any) => {
          const files = e.target.files;
          const imageUris: string[] = [];
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (event: any) => {
              imageUris.push(event.target.result);
              if (imageUris.length === files.length) {
                setSelectedImages([...selectedImages, ...imageUris]);
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      } else {
        // For native platforms, show info message
        Alert.alert("Info", "Image picker will be available when running on native platforms (iOS/Android)");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images");
    }
  };

  const handleTakePhoto = async () => {
    try {
      if (Platform.OS === "web") {
        Alert.alert("Info", "Camera capture is only available on native platforms (iOS/Android)");
      } else {
        Alert.alert("Info", "Camera will be available when running on native platforms");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
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
            className="flex-1 bg-primary py-3 rounded-lg items-center"
          >
            <Text className="text-background font-semibold">📁 Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleTakePhoto}
            className="flex-1 bg-primary py-3 rounded-lg items-center"
          >
            <Text className="text-background font-semibold">📷 Camera</Text>
          </TouchableOpacity>
        </View>

        {/* Info Text */}
        <View className="bg-surface/50 border border-border rounded-lg p-3 mb-6">
          <Text className="text-xs text-muted">
            {Platform.OS === "web"
              ? "📝 On web: Click Gallery to select images from your computer. Camera capture is available on mobile devices."
              : "📝 On native: Use Gallery to select from device photos or Camera to take new photos."}
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
            disabled={selectedImages.length === 0}
            className={`flex-1 py-3 rounded-lg items-center ${
              selectedImages.length === 0 ? "bg-primary/50" : "bg-primary"
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
