import { Stack, useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { useMedia } from "~/providers/mediaProviders";
import { Image } from 'expo-image';
import { AntDesign } from "@expo/vector-icons";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { getImagekitUrlFromPath } from "~/utils/imagekit";


export default function photoAssetPage(){

    const {id} = useLocalSearchParams<{id: string}>();
    let uri;
    let displayIcons = false;

    const {getPhotoByID, uploadPhoto} = useMedia();

    const asset = getPhotoByID(id);

    // all photo IDS end with 001, so if the id does not end with 001, it is a path
    if(!id.endsWith("001")){
        console.log('id/path: ' + id);
        uri = getImagekitUrlFromPath(id,[]);
        console.log('loaded with cloud uri: ' + uri);
    }
    else{

        // if there is no assets for a photo, display a message
        if(!asset){
            return (
                console.log('Photo not found'),
                <Text>Photo not found</Text>
            )
        }

        console.log('asset: ' + asset);
        // since there is an asset for the photo, this means the owner is...
        // viewing it. So, display upload and delete icons.
        displayIcons = true;
        
        // if the asset is not in supabase, display photo using local uri
        if(asset.isLocalPhoto){
            uri = asset.uri;
            console.log('loaded with local uri: ' + uri);
        }
        else{
            uri = getImagekitUrlFromPath(asset.path,[])
            console.log('loaded with cloud uri: ' + uri);
        }
    }

    

    return (
        <>
            {/* add a button at the top corner of each image page */}
            <Stack.Screen options={{ title: 'Photo', headerRight: () => 
                displayIcons ? (
                <>
                    <AntDesign onPress={() => uploadPhoto(asset)} name="cloudupload" size={20} color="black" />
                    {/* add functionality to the delete button */}
                    <AntDesign onPress={() => uploadPhoto(asset)} name="delete" size={20} color="red" />
                </> ) : null

            }}/>

            {/* display the image */}
            <Image source={{uri}} style={{width: '100%', height: '100%'}} contentFit="contain" /> 


        </>
    )

}