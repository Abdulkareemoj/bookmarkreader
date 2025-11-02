import { Plus, Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
	FlatList,
	Modal,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

interface Collection {
	id: string;
	label: string;
	count: number;
}

interface CollectionsManagerProps {
	collections: Collection[];
	onAddCollection: (name: string) => void;
	onDeleteCollection: (id: string) => void;
	onSelectCollection: (id: string) => void;
}

export function CollectionsManager({
	collections,
	onAddCollection,
	onDeleteCollection,
	onSelectCollection,
}: CollectionsManagerProps) {
	const [showModal, setShowModal] = useState(false);
	const [newCollectionName, setNewCollectionName] = useState("");

	const handleAddCollection = () => {
		if (newCollectionName.trim()) {
			onAddCollection(newCollectionName);
			setNewCollectionName("");
			setShowModal(false);
		}
	};

	return (
		<>
			<View className="border-gray-100 border-b bg-white px-4 py-3">
				<View className="mb-3 flex-row items-center justify-between">
					<Text className="font-bold text-gray-900 text-lg">Collections</Text>
					<TouchableOpacity
						onPress={() => setShowModal(true)}
						className="rounded-full bg-blue-500 p-2"
					>
						<Plus size={20} color="white" />
					</TouchableOpacity>
				</View>

				<FlatList
					data={collections}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<TouchableOpacity
							onPress={() => onSelectCollection(item.id)}
							className="mb-2 flex-row items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
						>
							<View>
								<Text className="font-medium text-gray-900">{item.label}</Text>
								<Text className="text-gray-600 text-xs">
									{item.count} items
								</Text>
							</View>
							<TouchableOpacity onPress={() => onDeleteCollection(item.id)}>
								<Trash2 size={18} color="#ef4444" />
							</TouchableOpacity>
						</TouchableOpacity>
					)}
					scrollEnabled={false}
				/>
			</View>

			{/* Add Collection Modal */}
			<Modal visible={showModal} transparent animationType="slide">
				<View className="flex-1 justify-end bg-black/50">
					<View className="rounded-t-2xl bg-white p-4">
						<Text className="mb-4 font-bold text-gray-900 text-lg">
							New Collection
						</Text>
						<TextInput
							placeholder="Collection name"
							value={newCollectionName}
							onChangeText={setNewCollectionName}
							className="mb-4 rounded-lg border border-gray-300 p-3 text-gray-900"
							placeholderTextColor="#9ca3af"
						/>
						<View className="flex-row gap-2">
							<TouchableOpacity
								onPress={() => setShowModal(false)}
								className="flex-1 rounded-lg bg-gray-100 py-3"
							>
								<Text className="text-center font-medium text-gray-700">
									Cancel
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={handleAddCollection}
								className="flex-1 rounded-lg bg-blue-500 py-3"
							>
								<Text className="text-center font-medium text-white">
									Create
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</>
	);
}
