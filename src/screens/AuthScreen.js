import React, { useState } from 'react';
import { 
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

export function AuthScreen() {
  const [activeTab, setActiveTab] = useState('login');
  
  // Campi per login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Campi aggiuntivi per registrazione
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { login, register, isLoading, error, clearError } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Errore', 'Inserisci email e password');
      return;
    }

    clearError();
    const result = await login(email, password);
    
    if (!result.success) {
      Alert.alert('Errore Login', result.message);
    } else {
      Alert.alert('Successo', 'Login effettuato con successo! 🎉');
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Errore', 'Compila tutti i campi');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Errore', 'Le password non coincidono');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Errore', 'La password deve essere di almeno 6 caratteri');
      return;
    }

    clearError();
    const userData = {
      firstName,
      lastName,
      email,
      password,
      birthDate: new Date('1990-01-01').toISOString(),
      packageType: 'free',
      packageExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const result = await register(userData);
    
    if (!result.success) {
      Alert.alert('Errore Registrazione', result.message);
    } else {
      Alert.alert('Successo', 'Registrazione completata! Benvenuto! 🎉');
    }
  };

  const handleSocialAuth = (provider) => {
    Alert.alert('Prossimamente', `Login con ${provider} sarà disponibile presto!`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{
              width: 64,
              height: 64,
              backgroundColor: '#030213',
              borderRadius: 32,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <Text style={{ fontSize: 32 }}>🏆</Text>
            </View>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#030213',
              marginBottom: 8
            }}>
              Challenge App
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#717182',
              textAlign: 'center',
              paddingHorizontal: 32
            }}>
              Partecipa alle challenge e vinci premi incredibili!
            </Text>
          </View>

          {/* Card Container */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4
          }}>
            {/* Tabs */}
            <View style={{
              flexDirection: 'row',
              backgroundColor: '#f3f3f5',
              borderRadius: 12,
              padding: 4,
              marginBottom: 24
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  alignItems: 'center',
                  borderRadius: 8,
                  backgroundColor: activeTab === 'login' ? 'white' : 'transparent',
                  shadowColor: activeTab === 'login' ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: activeTab === 'login' ? 0.1 : 0,
                  shadowRadius: 2,
                  elevation: activeTab === 'login' ? 2 : 0
                }}
                onPress={() => setActiveTab('login')}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: activeTab === 'login' ? '#030213' : '#717182'
                }}>
                  Accedi
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  alignItems: 'center',
                  borderRadius: 8,
                  backgroundColor: activeTab === 'register' ? 'white' : 'transparent',
                  shadowColor: activeTab === 'register' ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: activeTab === 'register' ? 0.1 : 0,
                  shadowRadius: 2,
                  elevation: activeTab === 'register' ? 2 : 0
                }}
                onPress={() => setActiveTab('register')}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: activeTab === 'register' ? '#030213' : '#717182'
                }}>
                  Registrati
                </Text>
              </TouchableOpacity>
            </View>

            {/* Errore globale */}
            {error && (
              <View style={{
                backgroundColor: '#fef2f2',
                borderColor: '#fecaca',
                borderWidth: 1,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16
              }}>
                <Text style={{
                  color: '#dc2626',
                  fontSize: 14,
                  textAlign: 'center'
                }}>
                  {error}
                </Text>
              </View>
            )}

            {/* Form LOGIN */}
            {activeTab === 'login' && (
              <View style={{ marginBottom: 24 }}>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#030213',
                    marginBottom: 8
                  }}>
                    Email
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: '#f3f3f5',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: '#030213'
                    }}
                    placeholder="inserisci@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#030213',
                    marginBottom: 8
                  }}>
                    Password
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: '#f3f3f5',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: '#030213'
                    }}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#030213',
                    borderRadius: 8,
                    paddingVertical: 16,
                    alignItems: 'center',
                    marginTop: 8,
                    opacity: isLoading ? 0.6 : 1
                  }}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={{
                      color: 'white',
                      fontSize: 16,
                      fontWeight: '600'
                    }}>
                      Accedi
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={{
                  alignItems: 'center',
                  marginTop: 16
                }}>
                  <Text style={{
                    color: '#030213',
                    fontSize: 14
                  }}>
                    Password dimenticata?
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Form REGISTER */}
            {activeTab === 'register' && (
              <View style={{ marginBottom: 24 }}>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#030213',
                    marginBottom: 8
                  }}>
                    Nome
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: '#f3f3f5',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: '#030213'
                    }}
                    placeholder="Il tuo nome"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#030213',
                    marginBottom: 8
                  }}>
                    Cognome
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: '#f3f3f5',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: '#030213'
                    }}
                    placeholder="Il tuo cognome"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#030213',
                    marginBottom: 8
                  }}>
                    Email
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: '#f3f3f5',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: '#030213'
                    }}
                    placeholder="inserisci@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#030213',
                    marginBottom: 8
                  }}>
                    Password
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: '#f3f3f5',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: '#030213'
                    }}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#030213',
                    marginBottom: 8
                  }}>
                    Conferma Password
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: '#f3f3f5',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: '#030213'
                    }}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#030213',
                    borderRadius: 8,
                    paddingVertical: 16,
                    alignItems: 'center',
                    marginTop: 8,
                    opacity: isLoading ? 0.6 : 1
                  }}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={{
                      color: 'white',
                      fontSize: 16,
                      fontWeight: '600'
                    }}>
                      Registrati
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Divider */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 24
            }}>
              <View style={{
                flex: 1,
                height: 1,
                backgroundColor: '#e5e7eb'
              }} />
              <Text style={{
                color: '#9ca3af',
                fontSize: 12,
                paddingHorizontal: 16,
                textTransform: 'uppercase'
              }}>
                oppure continua con
              </Text>
              <View style={{
                flex: 1,
                height: 1,
                backgroundColor: '#e5e7eb'
              }} />
            </View>

            {/* Social Login */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#f9fafb',
                  borderColor: '#e5e7eb',
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                  marginHorizontal: 4
                }}
                onPress={() => handleSocialAuth('Apple')}
              >
                <Text style={{ fontSize: 20 }}>🍎</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#f9fafb',
                  borderColor: '#e5e7eb',
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                  marginHorizontal: 4
                }}
                onPress={() => handleSocialAuth('Google')}
              >
                <Text style={{ fontSize: 20 }}>📧</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#f9fafb',
                  borderColor: '#e5e7eb',
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                  marginHorizontal: 4
                }}
                onPress={() => handleSocialAuth('Facebook')}
              >
                <Text style={{ fontSize: 20 }}>📘</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}