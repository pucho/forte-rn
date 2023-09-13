import React, { useEffect, useState } from "react";
import {
  View,
  Pressable,
  Image,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  StatusBar,
} from "react-native";

import { Link } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as MediaLibrary from "expo-media-library";

export default function App() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    // Get photos from app album on mount
    const fetchPhotos = async () => {
      const albums = await MediaLibrary.getAlbumsAsync();
      const appAlbum = albums.find(
        (album) => album.title === "NativeTestPictures"
      );

      if (appAlbum) {
        const albumPhotos = await MediaLibrary.getAssetsAsync({
          album: appAlbum,
          first: 100, // Fetch the first 100 photos, adjust as needed
        });
        setPhotos(albumPhotos.assets);
      }
    };

    fetchPhotos();
  }, []);

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.photoContainer}>
            <Image source={{ uri: item.uri }} style={styles.thumbnail} />
            <Text>{item.filename}</Text>
          </View>
        )}
      />
      <Link href="/takePicture" asChild>
        <Pressable style={styles.pressable}>
          <Ionicons name="md-add-circle" size={54} color="#34996b" />
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: "#4A5568",
    marginTop: StatusBar.currentHeight,
  },
  pressable: {
    position: "absolute",
    right: 20,
    bottom: 20,
  },
  photoContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  thumbnail: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
});
