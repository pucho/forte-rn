import { useRef, useState, useEffect } from "react";
import {
  Pressable,
  Text,
  TouchableOpacity,
  View,
  Image,
  SafeAreaView,
  StyleSheet,
} from "react-native";

import { Camera, CameraType } from "expo-camera";
import { router } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import { Link } from "expo-router";

export default function App() {
  let cameraRef = useRef();

  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();

  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const microphonePermission =
        await Camera.requestMicrophonePermissionsAsync();
      const mediaLibraryPermission =
        await MediaLibrary.requestPermissionsAsync();

      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMicrophonePermission(microphonePermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);

  if (
    hasCameraPermission === undefined ||
    hasMicrophonePermission === undefined
  ) {
    return (
      <SafeAreaView>
        <Text>Requestion permissions...</Text>
      </SafeAreaView>
    );
  } else if (!hasCameraPermission) {
    return (
      <SafeAreaView>
        <Text>Permission for camera not granted.</Text>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    let cameraOptions = {
      quality: 1,
      base64: true,
      exif: false,
    };

    let newPhoto = await cameraRef.current.takePictureAsync(cameraOptions);
    setPhoto(newPhoto);
  };

  const savePhoto = async () => {
    if (hasMediaLibraryPermission) {
      // 1. Save the Image to Media Library
      const savedPhoto = await MediaLibrary.createAssetAsync(photo.uri);

      // 2. Move the Image to the Album
      const albums = await MediaLibrary.getAlbumsAsync();
      const appAlbum = albums.find(
        (album) => album.title === "NativeTestPictures"
      );

      if (appAlbum) {
        await MediaLibrary.addAssetsToAlbumAsync([savedPhoto], appAlbum);
      } else {
        await MediaLibrary.createAlbumAsync("NativeTestPictures", savedPhoto);
      }

      // Clear the photoUri after saving (or based on your app's flow)
      setPhoto(null);
      router.push("/");
    }
  };

  if (photo) {
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <Image
          source={{ uri: "data:image/jpg;base64," + photo.base64 }}
          style={styles.imageVideo}
        />
        {hasMediaLibraryPermission && (
          <Pressable onPress={savePhoto} style={styles.pressableGreen}>
            <Text className="text-white">Save</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            setPhoto(null);
          }}
          style={styles.pressableRed}
        >
          <Text>Discard</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.mainView}>
      <Camera ref={cameraRef} style={styles.camera}></Camera>
      <Pressable style={styles.pressableGreen} onPress={takePicture}>
        <Text style={styles.textWhite}>Take picture</Text>
      </Pressable>
      <Link href="/" asChild>
        <Pressable style={styles.pressableGreen}>
          <Text style={styles.textWhite}>Home</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#4A5568",
  },
  imageVideo: {
    flex: 1,
    alignSelf: "stretch",
    marginBottom: 20,
  },
  pressableGreen: {
    backgroundColor: "#48BB78",
    padding: 8,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginBottom: 12,
  },
  pressableRed: {
    backgroundColor: "#F56565",
    padding: 8,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginBottom: 12,
  },
  mainView: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#4A5568",
  },
  camera: {
    height: "50%",
    marginBottom: 20,
  },
  textWhite: {
    color: "#FFFFFF",
  },
});
