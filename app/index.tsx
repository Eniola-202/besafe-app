import { Text, View, Button } from "react-native";
import './globals.css';
import {Shield} from 'lucide-react-native';
import {useRouter} from "expo-router";
//import register from "./auth/register.tsx";

export default function Index() {
    const router= useRouter();
    return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
            <Shield color={'blue'} size={100} />
            <Text style={{fontSize: 50, fontWeight: 'bold'}}>
                 BeSafe
            </Text>
        </View>
        <Text style={{fontSize:15}}>Keeping you safe at all times</Text>
        <View style={{marginTop: 20}}>
            <Button title="Get started" color="blue" onPress={() => router.push("/auth/register")} ></Button>
        </View>
    </View>
  );
}
