import { StatusBar, Text, View, TouchableOpacity, FlatList, PermissionsAndroid, Image, ScrollView, Alert, TextInput, KeyboardAvoidingView } from 'react-native';
import React, { useState, useEffect, Component, useRef } from 'react';
import axios from 'axios'
import Geolocation from 'react-native-geolocation-service';
import { SafeAreaView } from 'react-native-safe-area-context';
import './global.js';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';

const ChatLocScreen = () => {
    const [location, setLocation] = useState(false);

    const requestLocationPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Geolocation Permission',
            message: 'Can we access your location?',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
  
        if (granted === 'granted') {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        return false;
      }
    };
  
    const getLocation = async () => {
        try {
          const result = await requestLocationPermission();
          console.log('result is:', result);
  
          if (result) {
              const position = await new Promise((resolve, reject) => {
                  Geolocation.getCurrentPosition(
                      resolve,
                      reject,
                      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
                  );
              });
              console.log(position);
              setLocation(position);
              await sendLocationToServer(position.coords.latitude, position.coords.longitude, position.timestamp);
              // Date(position.timestamp).toString())
          }
        } catch (error) {
          console.log('Error getting location:', error);
          setLocation(false);
        }
        console.log(location);
    };

    const sendLocationToServer = async (lat, long, time) => {
        try {
          const UserData = { latitude: lat, longitude: long, timeStamp: time };
          const response = await axios.post('http://'+global.ip+':3000/add', UserData);
      
          console.log(response.data);
        } catch (error) {
          console.error('Error sending location to server', error);
        }
    };

    useEffect(() => {
        getLocation();
        const intervalId = setInterval(() => {
        getLocation();
        }, 20 * 60 * 1000); // 20 minutes in milliseconds
        return () => clearInterval(intervalId);
    }, []);


    const [messages, setMessages] = useState([]);
    const [recording, setRecording] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState(null);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ScrollViewRef = useRef();

    const clear = () => {
      setMessages([]);
    }

    const onSpeechStartHandler = () => {
      console.log('Speech started');
      setRecording(true);
      setSpeaking(true);
    }

    const onSpeechEndHandler = () => {
      console.log('Speech ended');
      setRecording(false);
      setSpeaking(false);
    }

    const onSpeechResultsHandler = async (result) => {
      try {
        console.log('Speech:', result);
        const transcribedText = result.value[0];
        console.log('User Input:', transcribedText);
        setUserInput(transcribedText);
      } catch (error) {
        console.error('Error processing speech results:', error);
      }
    };
    
    useEffect(() => {
      const sendUserInput = async () => {
        try {
          await sendUserInputToServer();
          setUserInput('');
          
          setRecording(false);
          setSpeaking(false);
        } catch (error) {
          console.error('Error sending user input to server', error);
        }
      };
      if (userInput.trim() !== '') {
        sendUserInput();
      }
    }, [userInput]);

    const onSpeechErrorHandler = (e) => {
      console.log('Error:', e);
      setError(e.error);
    }


    useEffect(() => {
      console.log('Setting up voice listeners');
      Voice.onSpeechStart = onSpeechStartHandler;
      Voice.onSpeechEnd = onSpeechEndHandler;
      Voice.onSpeechResults = onSpeechResultsHandler;
      Voice.onSpeechError = onSpeechErrorHandler;

      Tts.addEventListener('tts-start', (event) => console.log("start", event));
      Tts.addEventListener('tts-progress', (event) => console.log("progress", event));
      Tts.addEventListener('tts-finish', (event) => console.log("finish", event));
      Tts.addEventListener('tts-cancel', (event) => console.log("cancel", event));

      const ttsStartListener = Tts.addEventListener('tts-start', () => {
        setIsSpeaking(true);
      });
    
      const ttsFinishListener = Tts.addEventListener('tts-finish', () => {
        setIsSpeaking(false);
      });

      return () => {
        Voice.destroy().then(Voice.removeAllListeners);
        ttsStartListener.remove();
        ttsFinishListener.remove();
      }
    }, []);

    const requestSpeechRecognitionPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Speech Recognition Permission',
            message: 'Can we access your microphone for speech recognition?',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
  
        if (granted === 'granted') {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        return false;
      }
    };

    const startRecording = async () => {
      try {
        const speechRecognitionPermissionGranted = await requestSpeechRecognitionPermission();
  
        if (speechRecognitionPermissionGranted) {
          // console.log('Speech recognition permission granted');
          setRecording(true);
          try{
            console.log('Starting recording');
            await Voice.start('en-GB');
          } catch(e){
            console.log('Error starting recording:', e);
          }
        } else {
          console.log('Speech recognition permission denied');
          Alert.alert('Speech recognition permission denied');
        }
      } catch (e) {
        console.error('Error starting recording:', e);
      }
    };

    const stopRecording = async () => {
      try {
        console.log('Stopping recording');
        await Voice.stop();
        setRecording(false);
      } catch (e) {
        console.error('Error stopping recording:', e);
      }
    }

    const sendUserInputToServer = async () => {
      try {
        console.log('Sending user input to server:', userInput);
        if (userInput.trim() === '') {
          return;
        }
        setIsLoading(true);
        const msg = userInput.trim();
        setMessages((prevMessages) => [...prevMessages, { role: 'user', content: msg }]);
        const MsgData = { query: msg };
        const response = await axios.post('http://' + global.ip + ':3000/generateAIResponse', MsgData);
    
        const answer = response.data;
        // console.log('Bot response:', answer);
        setMessages((prevMessages) => [...prevMessages, { role: 'bot', content: answer }]);
        updateScrollView();
        startTextToSpeech(answer);
        setUserInput('');
        setIsLoading(false);
      } catch (error) {
        console.error('Error sending user input to server', error);
      }
    };

    const updateScrollView = () => {
      setTimeout(() => {
        ScrollViewRef?.current?.scrollToEnd({ animated: true });
      }, 200);
    }

    const startTextToSpeech = text => {
      console.log('Speaking:', text);
      Tts.speak(text, {
        androidParams: {
          KEY_PARAM_PAN: -1,
          KEY_PARAM_VOLUME: 0.8,
          KEY_PARAM_STREAM: 'STREAM_MUSIC',
        },
      });
    }

    const repeat = () => {
      try {
        if (isSpeaking) {
          Tts.stop();
          setIsSpeaking(false);
        } else {
          const lastBotMessage = messages.slice().reverse().find((msg) => msg.role === 'bot');
          if (lastBotMessage) {
            startTextToSpeech(lastBotMessage.content);
          }
          setIsSpeaking(true);
        }
      } catch (error) {
        console.error('Error checking TTS status or stopping TTS:', error);
      }
    };
  

    return (
      <KeyboardAvoidingView className="flex-1 bg-white py-2">
          <StatusBar style="auto" />
          <SafeAreaView className="flex flex-1 mx-3">
            <View className="flex-row justify-center">
              <Image source={require('../assets/images/bot.png')} style={{height: hp(10), width: hp(10)}}/>
            </View>
              { messages.length > 0 ? (
                <View className="space-y-2 flex-none">
                  <Text style={{fontSize: wp(5)}} className="text-gray-700 font-semibold ml-1">Assistant</Text>
                  <View style={{height: hp(58)}} className="bg-neutral-200 rounded-3xl p-4">
                    <ScrollView ref={ScrollViewRef} bounces={false} className="space-y-4" showsVerticalScrollIndicator={false}>
                      {
                        messages.map((msg, index) => {
                          if(msg.role == 'bot'){
                            return (
                              <View key={index} style={{width: wp(70)}} className="bg-emerald-100 rounded-xl p-4 rounded-tl-none">
                                <Text className="text-black text-base">{msg.content}</Text>
                              </View>
                            )
                          }
                          else{
                            return (
                              <View key={index} className="flex-row justify-end">
                                <View style={{width: wp(70)}} className="bg-white rounded-xl p-4 rounded-tr-none">
                                  <Text className="text-black text-base">{msg.content}</Text>
                                </View>
                              </View>
                            )
                          }
                        })
                      }
                    </ScrollView>
                  </View>
                </View>
              ) : (
                <View className="space-y-2 flex-none">
                <Text style={{fontSize: wp(5)}} className="text-gray-700 font-semibold ml-1">Assistant</Text>
                  <View style={{height: hp(58)}} className="bg-neutral-200 rounded-3xl p-4">
                    <View className="items-center justify-center w-full h-full">
                      <View style={{width: wp(70)}} className="bg-white items-center justify-center rounded-xl p-4">
                        <Text className="text-black text-base">No messages yet</Text>
                      </View>
                    </View>
                  </View>
                </View>
                )
              }
              <KeyboardAvoidingView className="mt-4 flex justify-center items-center">
                <KeyboardAvoidingView className="w-full flex flex-row">
                  <TextInput
                  className="bg-slate-200 w-3/4 rounded-3xl flex-1 justify-start p-4"
                  placeholder="Type your message here..."
                  value={userInput}
                  onChangeText={(text) => setUserInput(text)}
                />
                <TouchableOpacity onPress={sendUserInputToServer}>
                  <Image 
                    className="rounded-full"
                    style={{width: hp(8), height: hp(8)}}
                    source={require('../assets/images/send.png')}
                  />
                  </TouchableOpacity>
                </KeyboardAvoidingView>
  
                <View className="mt-4 flex-row justify-center items-center w-full">
                  {
                    isLoading ? (
                      <TouchableOpacity>
                        <Image 
                          className="rounded-full"
                          style={{width: hp(10), height: hp(10)}}
                          source={require('../assets/images/loading.gif')}
                        />
                      </TouchableOpacity>
                    ) : 
                      recording? (
                        <TouchableOpacity onPress={stopRecording}>
                          <Image 
                          className="rounded-full"
                          style={{width: hp(10), height: hp(10)}}
                          source={require('../assets/images/rmic2.gif')}
                          />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity onPress={startRecording}>
                          <Image 
                          className="rounded-full"
                          style={{width: hp(10), height: hp(10)}}
                          source={require('../assets/images/mic.webp')}
                          />
                        </TouchableOpacity>
                      )
                  }

                  {
                    (
                      <TouchableOpacity className="bg-neutral-400 rounded-3xl px-6 py-2 absolute right-6"
                      onPress={clear}>
                        <Text className="text-white font-semibold">Clear</Text>
                      </TouchableOpacity>
                    )
                  }
                  {
                    messages.length > 0 ? (
                      isSpeaking ? (
                        <TouchableOpacity className="bg-red-500 rounded-3xl px-6 py-2 absolute left-6"
                        onPress={repeat}>
                          <Text className="text-white font-semibold">Stop</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity className="bg-emerald-600 rounded-3xl px-6 py-2 absolute left-6"
                        onPress={repeat}>
                          <Text className="text-white font-semibold">Repeat</Text>
                        </TouchableOpacity>
                      )
                    ) : (
                      <TouchableOpacity className="bg-gray-500 rounded-3xl px-4 py-2 absolute left-6"
                      disabled={true}>
                        <Text className="text-white font-semibold">Repeat</Text>
                      </TouchableOpacity>
                    )
                  }
                </View>
              </KeyboardAvoidingView>
          </SafeAreaView>
      </KeyboardAvoidingView>
    )
}

export default ChatLocScreen