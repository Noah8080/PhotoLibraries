import { Stack, useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { useMedia } from "~/providers/mediaProviders";
import { Image } from 'expo-image';
import { AntDesign } from "@expo/vector-icons";


export default function photoAssetPage(){

    const {id} = useLocalSearchParams<{id: string}>();
    const {getPhotoByID, uploadPhoto} = useMedia();

    const asset = getPhotoByID(id);


    if(!asset){
        return (
            <Text>Photo not found</Text>
        )
    }


    return (
        <>
            {/* add a button at the top corner of each image page */}
            <Stack.Screen options={{ title: 'Photo', headerRight: () => 
                <AntDesign onPress={() => uploadPhoto(asset)} name="cloudupload" size={20} color="black" /> }} />

            {/* display the image */}
            <Image source={{uri: asset.uri}} style={{width: '100%', height: '100%'}} contentFit="contain" />
        </>
    )

}