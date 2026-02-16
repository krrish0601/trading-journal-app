import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your trade notes...",
}: RichTextEditorProps) {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const insertText = (prefix: string, suffix: string = "") => {
    const newText = value + prefix + suffix;
    onChange(newText);
  };

  const insertBullet = () => {
    const lines = value.split("\n");
    const newLine = "\n• ";
    onChange(value + newLine);
  };

  const insertCheckbox = () => {
    const newLine = "\n☐ ";
    onChange(value + newLine);
  };

  return (
    <View className="bg-surface rounded-lg overflow-hidden border border-border">
      {/* Toolbar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-surface/50 border-b border-border p-2 flex-row gap-2"
      >
        <TouchableOpacity
          onPress={() => insertText("**", "**")}
          className={`px-3 py-2 rounded ${
            isBold ? "bg-primary" : "bg-surface"
          }`}
        >
          <Text className={`font-bold ${isBold ? "text-background" : "text-foreground"}`}>
            B
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => insertText("_", "_")}
          className={`px-3 py-2 rounded ${
            isItalic ? "bg-primary" : "bg-surface"
          }`}
        >
          <Text className={`italic ${isItalic ? "text-background" : "text-foreground"}`}>
            I
          </Text>
        </TouchableOpacity>

        <View className="w-px bg-border" />

        <TouchableOpacity
          onPress={insertBullet}
          className="px-3 py-2 rounded bg-surface"
        >
          <Text className="text-foreground">• List</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={insertCheckbox}
          className="px-3 py-2 rounded bg-surface"
        >
          <Text className="text-foreground">☐ Task</Text>
        </TouchableOpacity>

        <View className="w-px bg-border" />

        <TouchableOpacity
          onPress={() => insertText("\n---\n")}
          className="px-3 py-2 rounded bg-surface"
        >
          <Text className="text-foreground">— Line</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Editor */}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline
        numberOfLines={6}
        className="p-4 text-foreground bg-background"
        style={{ textAlignVertical: "top" }}
      />

      {/* Character count */}
      <View className="px-4 py-2 bg-surface/50 border-t border-border flex-row justify-between">
        <Text className="text-xs text-muted">
          {value.length} characters
        </Text>
        <Text className="text-xs text-muted">
          {value.split("\n").length} lines
        </Text>
      </View>
    </View>
  );
}
