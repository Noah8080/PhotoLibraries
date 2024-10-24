import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { useMedia } from "~/providers/mediaProviders";
import { Image } from 'expo-image';


export default function photoAssetPage(){

    const {id} = useLocalSearchParams<{id: string}>();
    const {getPhotoByID} = useMedia();

    const asset = getPhotoByID(id);


    if(!asset){
        return (
            <Text>Photo not found</Text>
        )
    }


    return (
        <>
            <Image source={{uri: asset.uri}} style={{width: '100%', height: '100%'}} contentFit="contain" />
        </>
    )

}