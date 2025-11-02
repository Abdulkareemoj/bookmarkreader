import { Check, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

interface AnnotationModalProps {
	visible: boolean;
	onClose: () => void;
	onSave: (text: string) => void;
}

export function AnnotationModal({
	visible,
	onClose,
	onSave,
}: AnnotationModalProps) {
	const [text, setText] = useState("");

	const handleSave = () => {
		if (text.trim()) {
			onSave(text);
			setText("");
			onClose();
		}
	};

	return (
		<Modal visible={visible} transparent animationType="slide">
			<View className="flex-1 justify-end bg-black/50">
				<View className="rounded-t-2xl bg-white p-4">
					{/* Header */}
					<View className="mb-4 flex-row items-center justify-between">
						<Text className="font-bold text-gray-900 text-lg">Add Note</Text>
						<TouchableOpacity onPress={onClose}>
							<X size={24} color="#6b7280" />
						</TouchableOpacity>
					</View>

					{/* Input */}
					<TextInput
						placeholder="Write your note here..."
						value={text}
						onChangeText={setText}
						multiline
						numberOfLines={4}
						className="mb-4 rounded-lg border border-gray-300 p-3 text-gray-900"
						placeholderTextColor="#9ca3af"
					/>

					{/* Actions */}
					<View className="flex-row gap-2">
						<TouchableOpacity
							onPress={onClose}
							className="flex-1 rounded-lg bg-gray-100 py-3"
						>
							<Text className="text-center font-medium text-gray-700">
								Cancel
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={handleSave}
							className="flex-1 flex-row items-center justify-center rounded-lg bg-blue-500 py-3"
						>
							<Check size={20} color="white" />
							<Text className="ml-2 font-medium text-white">Save</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
}
