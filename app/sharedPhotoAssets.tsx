import { Stack, useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { useMedia } from "~/providers/mediaProviders";
import { Image } from 'expo-image';
import { AntDesign } from "@expo/vector-icons";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { getImagekitUrlFromPath } from "~/utils/imagekit";

export default function sharedPhotoAssetsPage() {

    const {path} = useLocalSearchParams<{path: string}>();
    console.log('sPA reached');
    console.log('path: ' + path);

    if(!path){
        return (
            <Text>Photo path not found</Text>
        )
    }

    let uri;
    uri = getImagekitUrlFromPath(path,[])

    return (
        <>
            {/* display the image */}
            <Image source={{uri}} style={{width: '100%', height: '100%'}} contentFit="contain" /> 
        </>

    )

}