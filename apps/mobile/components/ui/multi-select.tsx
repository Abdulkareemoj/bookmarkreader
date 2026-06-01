import { cn } from "@/lib/utils";
import { Check, Plus, X } from "lucide-react-native";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";
import { Text } from "./text";

export interface Option {
	value: string;
	label: string;
	disable?: boolean;
	fixed?: boolean;
	[key: string]: string | boolean | undefined;
}

interface GroupOption {
	[key: string]: Option[];
}

interface MultiSelectProps {
	value?: Option[];
	defaultOptions?: Option[];
	options?: Option[];
	placeholder?: string;
	loadingIndicator?: React.ReactNode;
	emptyIndicator?: React.ReactNode;
	delay?: number;
	triggerSearchOnFocus?: boolean;
	onSearch?: (value: string) => Promise<Option[]>;
	onSearchSync?: (value: string) => Option[];
	onChange?: (options: Option[]) => void;
	maxSelected?: number;
	onMaxSelected?: (maxLimit: number) => void;
	hidePlaceholderWhenSelected?: boolean;
	disabled?: boolean;
	groupBy?: string;
	className?: string;
	badgeClassName?: string;
	selectFirstItem?: boolean;
	creatable?: boolean;
	inputProps?: React.ComponentProps<typeof TextInput>;
	hideClearAllButton?: boolean;
}

function useDebounce<T>(value: T, delay?: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay || 500);
		return () => clearTimeout(timer);
	}, [value, delay]);
	return debouncedValue;
}

function transToGroupOption(options: Option[], groupBy?: string): GroupOption {
	if (options.length === 0) return {};
	if (!groupBy) return { "": options };
	const groupOption: GroupOption = {};
	options.forEach((option) => {
		const key = (option[groupBy] as string) || "";
		if (!groupOption[key]) groupOption[key] = [];
		groupOption[key].push(option);
	});
	return groupOption;
}

function removePickedOption(
	groupOption: GroupOption,
	picked: Option[],
): GroupOption {
	const clone: GroupOption = {};
	for (const [key, value] of Object.entries(groupOption)) {
		const filtered = value.filter(
			(val) => !picked.find((p) => p.value === val.value),
		);
		if (filtered.length > 0) clone[key] = filtered;
	}
	return clone;
}

function isOptionsExist(
	groupOption: GroupOption,
	targetOption: Option[],
): boolean {
	for (const [, value] of Object.entries(groupOption)) {
		if (
			value.some((option) => targetOption.find((p) => p.value === option.value))
		)
			return true;
	}
	return false;
}

export function MultiSelect({
	value,
	onChange,
	placeholder,
	defaultOptions: arrayDefaultOptions = [],
	options: arrayOptions,
	delay,
	onSearch,
	onSearchSync,
	loadingIndicator,
	emptyIndicator,
	maxSelected = Number.MAX_SAFE_INTEGER,
	onMaxSelected,
	hidePlaceholderWhenSelected,
	disabled,
	groupBy,
	className,
	badgeClassName,
	selectFirstItem = true,
	creatable = false,
	triggerSearchOnFocus = false,
	inputProps,
	hideClearAllButton = false,
}: MultiSelectProps) {
	const inputRef = useRef<TextInput>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [selected, setSelected] = useState<Option[]>(value || []);
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const debouncedSearchTerm = useDebounce(inputValue, delay || 500);

	const internalOptions = useMemo(
		() => transToGroupOption(arrayOptions || arrayDefaultOptions, groupBy),
		[arrayOptions, arrayDefaultOptions, groupBy],
	);
	const [options, setOptions] = useState<GroupOption>(internalOptions);

	useEffect(() => {
		if (value) setSelected(value);
	}, [value]);

	useEffect(() => {
		if (!arrayOptions || onSearch) return;
		const newOption = transToGroupOption(arrayOptions, groupBy);
		if (JSON.stringify(newOption) !== JSON.stringify(options)) {
			setOptions(newOption);
		}
	}, [arrayOptions, groupBy, onSearch]);

	useEffect(() => {
		if (debouncedSearchTerm && onSearchSync && isOpen) {
			const res = onSearchSync(debouncedSearchTerm);
			setOptions(transToGroupOption(res || [], groupBy));
		}
	}, [debouncedSearchTerm, groupBy, isOpen, onSearchSync]);

	useEffect(() => {
		if (!onSearch || !isOpen) return;
		const doSearch = async () => {
			setIsLoading(true);
			const res = await onSearch(debouncedSearchTerm);
			setOptions(transToGroupOption(res || [], groupBy));
			setIsLoading(false);
		};
		doSearch();
	}, [debouncedSearchTerm, groupBy, isOpen, onSearch]);

	const handleSelect = useCallback(
		(option: Option) => {
			if (selected.length >= maxSelected) {
				onMaxSelected?.(selected.length);
				return;
			}
			const newOptions = [...selected, option];
			setSelected(newOptions);
			setInputValue("");
			onChange?.(newOptions);
		},
		[selected, maxSelected, onMaxSelected, onChange],
	);

	const handleUnselect = useCallback(
		(option: Option) => {
			if (option.fixed) return;
			const newOptions = selected.filter((s) => s.value !== option.value);
			setSelected(newOptions);
			onChange?.(newOptions);
		},
		[selected, onChange],
	);

	const handleClearAll = useCallback(() => {
		const fixed = selected.filter((s) => s.fixed);
		setSelected(fixed);
		onChange?.(fixed);
	}, [selected, onChange]);

	const handleCreate = useCallback(() => {
		if (!creatable || !inputValue.trim()) return;
		if (selected.length >= maxSelected) {
			onMaxSelected?.(selected.length);
			return;
		}
		const newOption: Option = {
			value: inputValue.trim(),
			label: inputValue.trim(),
		};
		handleSelect(newOption);
		setInputValue("");
	}, [
		creatable,
		inputValue,
		selected,
		maxSelected,
		onMaxSelected,
		handleSelect,
	]);

	const selectables = useMemo(
		() => removePickedOption(options, selected),
		[options, selected],
	);

	const showCreateOption =
		creatable &&
		inputValue.trim().length > 0 &&
		!isOptionsExist(options, [
			{ value: inputValue.trim(), label: inputValue.trim() },
		]) &&
		!selected.find((s) => s.value === inputValue.trim()) &&
		(!onSearch || (debouncedSearchTerm.length > 0 && !isLoading));

	const showClearAll =
		!hideClearAllButton &&
		!disabled &&
		selected.length > 0 &&
		selected.filter((s) => s.fixed).length < selected.length;

	const allOptionEntries = Object.entries(selectables);

	const shouldShowEmpty =
		!isLoading && allOptionEntries.length === 0 && !showCreateOption;

	return (
		<View className={cn("w-full", className)}>
			<View
				className={cn(
					"border-input min-h-[44px] flex-row flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-2",
					isOpen && "border-ring",
					disabled && "opacity-50",
				)}
			>
				{selected.map((option) => (
					<View
						key={option.value}
						className={cn(
							"flex-row items-center gap-1 rounded-md border bg-card py-1 pl-2 pr-1",
							badgeClassName,
						)}
					>
						<Text className="text-xs font-medium text-foreground">
							{option.label}
						</Text>
						{!option.fixed && (
							<Pressable
								onPress={(e) => {
									e.stopPropagation();
									handleUnselect(option);
								}}
								hitSlop={8}
								className="ml-0.5 rounded-sm p-0.5 active:bg-muted"
							>
								<X size={12} className="text-muted-foreground" />
							</Pressable>
						)}
					</View>
				))}
				<TextInput
					ref={inputRef}
					value={inputValue}
					onChangeText={setInputValue}
					onFocus={() => {
						setIsOpen(true);
						if (triggerSearchOnFocus && onSearch) {
							onSearch(inputValue);
						}
					}}
					onBlur={() => {
						// Delay closing so option presses register
						setTimeout(() => setIsOpen(false), 200);
					}}
					placeholder={
						hidePlaceholderWhenSelected && selected.length > 0
							? ""
							: placeholder || "Select..."
					}
					placeholderTextColor="#9ca3af"
					className={cn(
						"flex-1 px-1 py-0.5 text-sm text-foreground",
						selected.length > 0 ? "min-w-[80px]" : "",
					)}
					{...inputProps}
				/>
				{showClearAll && (
					<Pressable
						onPress={handleClearAll}
						hitSlop={8}
						className="rounded-sm p-0.5 active:bg-muted"
					>
						<X size={14} className="text-muted-foreground" />
					</Pressable>
				)}
			</View>

			{isOpen && (
				<View className="border-input mt-1 max-h-48 overflow-hidden rounded-md border bg-background shadow-lg">
					{isLoading && loadingIndicator ? (
						<View className="items-center justify-center py-8">
							{loadingIndicator}
						</View>
					) : (
						<FlatList
							data={allOptionEntries}
							keyExtractor={([key]) => key}
							contentContainerStyle={{ paddingVertical: 4 }}
							ListEmptyComponent={
								shouldShowEmpty ? (
									<View className="items-center py-8">
										{emptyIndicator || (
											<Text className="text-sm text-muted-foreground">
												No results found
											</Text>
										)}
									</View>
								) : null
							}
							keyboardShouldPersistTaps="handled"
							renderItem={({ item: [groupKey, groupOptions] }) => (
								<View>
									{groupKey ? (
										<Text className="mb-1 px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
											{groupKey}
										</Text>
									) : null}
									{groupOptions.map((option) => {
										const isSelected = selected.some(
											(s) => s.value === option.value,
										);
										return (
											<Pressable
												key={option.value}
												onPress={() => handleSelect(option)}
												disabled={option.disable || isSelected}
												className={cn(
													"flex-row items-center justify-between px-3 py-2.5",
													option.disable || isSelected
														? "opacity-50"
														: "active:bg-accent",
												)}
											>
												<Text
													className={cn(
														"text-sm",
														isSelected
															? "text-muted-foreground"
															: "text-foreground",
													)}
												>
													{option.label}
												</Text>
												{isSelected && (
													<Check size={16} className="text-primary" />
												)}
											</Pressable>
										);
									})}
								</View>
							)}
							ListFooterComponent={
								showCreateOption ? (
									<Pressable
										onPress={handleCreate}
										className="flex-row items-center gap-2 px-3 py-2.5 active:bg-accent"
									>
										<Plus size={16} className="text-muted-foreground" />
										<Text className="text-sm text-foreground">
											Create &ldquo;{inputValue.trim()}&rdquo;
										</Text>
									</Pressable>
								) : null
							}
						/>
					)}
				</View>
			)}
		</View>
	);
}

MultiSelect.displayName = "MultiSelect";
