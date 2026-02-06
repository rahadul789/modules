import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SearchBar = ({
  value,
  onChangeText,
  onClear,
  placeholder = "Search restaurants...",
  loading = false,
  onFocus,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleClear = () => {
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      <Ionicons
        name="search"
        size={20}
        color="#999"
        style={styles.searchIcon}
      />

      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {loading && (
        <ActivityIndicator size="small" color="#007AFF" style={styles.loader} />
      )}

      {!loading && value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={20} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  containerFocused: {
    borderColor: "#007AFF",
    backgroundColor: "#FFFFFF",
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    padding: 0,
  },
  loader: {
    marginLeft: 8,
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
});

export default SearchBar;
