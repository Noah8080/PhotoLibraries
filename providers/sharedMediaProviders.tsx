import { createContext, PropsWithChildren, useContext } from "react";
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { decode } from "base64-arraybuffer";
import { supabase } from "~/utils/supabase";
import { useAuthentication } from "./authenticationProvider";
import { store } from "expo-router/build/global-state/router-store";
import photoAssetPage from "~/app/photoAsset";
