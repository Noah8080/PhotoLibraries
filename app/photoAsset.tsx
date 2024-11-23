import { Stack, useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { useMedia } from "~/providers/mediaProviders";
import { Image } from 'expo-image';
import { AntDesign } from "@expo/vector-icons";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { getImagekitUrlFromPath } from "~/utils/imagekit";


export default function photoAssetPage(){

    const {id} = useLocalSearchParams<{id: string}>();
    const {getPhotoByID, uploadPhoto} = useMedia();

    const asset = getPhotoByID(id);


    // if there is no assets for a photo, display a message
    if(!asset){
        return (
            <Text>Photo not found</Text>
        )
    }

    console.log('asset: ' + asset);
    let uri;
    
    // if the asset is not in supabase, display photo using local uri
    if(asset.isLocalPhoto){
        uri = asset.uri;
        console.log('loaded with local uri: ' + uri);
    }
    else{
        uri = getImagekitUrlFromPath(asset.path,[])
        console.log('loaded with cloud uri: ' + uri);
    }


    return (
        <>
            {/* add a button at the top corner of each image page */}
            <Stack.Screen options={{ title: 'Photo', headerRight: () => 
                <AntDesign onPress={() => uploadPhoto(asset)} name="cloudupload" size={20} color="black" /> }} />

            {/* display the image */}
            <Image source={{uri}} style={{width: '100%', height: '100%'}} contentFit="contain" /> 


        </>
    )

}