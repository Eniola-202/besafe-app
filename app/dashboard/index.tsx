import { useState } from 'react';
import { View, Button, Text, TouchableOpacity, Switch} from 'react-native';
import {TriangleAlert, Fingerprint, Camera, Settings, Clock4} from 'lucide-react-native';
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

export default function Index() {
    const [recognizing, setRecognizing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [darkMode, setDarkMode]= useState(false);

    const theme = {
        background: darkMode ? '#1a1a1a' : '#ecf0f1',
        text: darkMode ? '#ffffff' : '#000000',
        buttonBg: darkMode ? '#4a4a4a' : '#007AFF',
        buttonText: '#ffffff',
        stopButtonBg: '#ff4444',
    };

    useSpeechRecognitionEvent('result', (event:any) => {
        setTranscript(event.results[0]?.transcript);
    });

    useSpeechRecognitionEvent('end', () => {
        setRecognizing(false);
    });

    const start = async () => {
        const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!result.granted) {
            console.warn('Permissions not granted', result);
            return;
        }
        ExpoSpeechRecognitionModule.start({
            lang: 'en-US',
            interimResults: true,
            maxAlternatives: 3,
        });
        setRecognizing(true);
    };

    const stop = () => {
        ExpoSpeechRecognitionModule.stop();
        setRecognizing(false);
    };

    return (
        <View style={{flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.background,
            padding: 20,}}>
            {/* Dark Mode Toggle */}
            <View style={{
                position: 'absolute',
                top: 50,
                right: 20,
                flexDirection: 'row',
                alignItems: 'center',
            }}>
                <Text style={{
                    color: theme.text,
                    marginRight: 10,
                    fontSize: 16,
                }}>
                    {darkMode ? '🌙' : '☀️'}
                </Text>
                <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={darkMode ? '#007AFF' : '#f4f3f4'}
                />
            </View>

            <TouchableOpacity
                onPress={recognizing ? stop : start}
                style={{
                    backgroundColor: recognizing ? '#ff4444' : '#0096FF',
                    height: 210,
                    width: 210,
                    borderRadius: 110,
                    elevation: 3,  // Android shadow
                    shadowColor: '#000',  // iOS shadow
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,

                }}
            >
                <Text style={{
                    color: 'white',
                    fontSize: 20,
                    fontWeight: 'bold',
                    marginTop:65,
                    textAlign: 'center',
                }}>
                    {recognizing ? (<View style={{marginTop:30}}>Stop</View>):( <View style={{flex:1, justifyContent:'center', alignItems:'center'}}> <Fingerprint size={50} style={{marginTop:-10, paddingVertical:10}}/>Start Monitoring</View>) }
                </Text>
            </TouchableOpacity>
            <Text style={{marginTop: 20,
                fontSize: 16,
                textAlign: 'center',
           }}>{transcript}</Text>
        <TouchableOpacity
            style={{backgroundColor: '#ff4444',
            paddingVertical:14,
            paddingHorizontal:25,
            borderRadius:15,
            marginTop:20,}}>
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <View style={{flexDirection:'row', }}>
                    <TriangleAlert color='white' height={20} width={20} fontWeight={'bold'}/>
                    <Text style={{color:'white', fontWeight:'bold'}}>  Emergency SOS</Text>
                </View>
            </View>
        </TouchableOpacity>
            <View style={{height: 80,position:'absolute', bottom:0, width:390, justifyContent: 'center', alignItems:'center'}}>
                <View style={{flexDirection: 'row', gap:75}}>
                    <Camera/>
                    <Clock4/>
                    <Settings/>
                </View>
            </View>
        </View>
    );
}
