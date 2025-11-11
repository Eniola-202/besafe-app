import {Text, View, TextInput, TouchableOpacity} from "react-native";
import {Shield} from "lucide-react-native";
import {useRouter} from "expo-router";

export default function Register(){
    const router = useRouter();

    return(
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10}} >
                <Shield color={'#0096FF'} size={70} />
                <Text style={{fontSize: 30, fontWeight: 'bold'}}>
                    BeSafe
                </Text>
            </View>
            <View>
                <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: 18, fontWeight: '500', margin:4,  }}>Full name</Text>
                    <TextInput style={{height: 30, borderColor: "#1E90FF", borderWidth: 1,  borderRadius: 10, marginVertical: 5, paddingHorizontal: 15, fontSize: 16, color: "#000", backgroundColor: "#F9F9F9", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, }}></TextInput>
                    <Text style={{fontSize: 18, fontWeight: '500', margin:4, }}>Email</Text>
                    <TextInput style={{height: 30, borderColor: "#1E90FF", borderWidth: 1,  borderRadius: 10, marginVertical: 5, paddingHorizontal: 15, fontSize: 16, color: "#000", backgroundColor: "#F9F9F9", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, }}></TextInput>
                    <Text style={{fontSize: 18, fontWeight: '500', margin:4,  }}>Password</Text>
                    <TextInput style={{height: 30, borderColor: "#1E90FF", borderWidth: 1,  borderRadius: 10, marginVertical: 5, paddingHorizontal: 15, fontSize: 16, color: "#000", backgroundColor: "#F9F9F9", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, }}></TextInput>
                    {/*<Text style={{fontSize: 18, fontWeight: '500', margin:4,  }}>Confirm Password</Text>*/}
                    {/*<TextInput style={{height: 30, borderColor: "#1E90FF", borderWidth: 1,  borderRadius: 10, marginVertical: 5, paddingHorizontal: 15, fontSize: 16, color: "#000", backgroundColor: "#F9F9F9", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, }}></TextInput>*/}
                </View>
            </View>
            <TouchableOpacity
                style={{
                    backgroundColor: "#0096FF",
                    paddingVertical: 10,
                    paddingHorizontal: 30,
                    borderRadius: 8,
                    marginVertical: 25,
                }}
                onPress={()=> router.replace("/dashboard")}
            >
                <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
                    Sign up
                </Text>
            </TouchableOpacity>
            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
            <Text>Already have an account?
                <TouchableOpacity>
                    <Text style={{color: '#FFA500', fontWeight: 'bold'}}> Sign in</Text>
                </TouchableOpacity>
            </Text>
            </View>
        </View>
    );
};
