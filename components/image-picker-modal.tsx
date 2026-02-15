import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
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
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      // Mock implementation - in real app would use expo-image-picker
      Alert.alert("Info", "Image picker will be available on native platforms");
    } catch (error) {
      Alert.alert("Error", "Failed to pick images");
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Mock implementation - in real app would use expo-image-picker
      Alert.alert("Info", "Camera will be available on native platforms");
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const handleRemoveImage = (uri: string) => {
    setSelectedImages(selectedImages.filter((img) => img !== uri));
  };

  const handleConfirm = () => {
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
                    className="w-24 h-24 rounded-lg"
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(uri)}
                    className="absolute top-0 right-0 bg-error rounded-full w-6 h-6 items-center justify-center"
                  >
                    <Text className="text-background font-bold text-sm">✕</Text>
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
              selectedImages.length === 0
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
