// App.js
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator, View } from 'react-native';
import { store, persistor } from './src/store/store';
import { MainApp } from './src/components/MainApp';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#030213" />
          </View>
        } 
        persistor={persistor}
      >
        <MainApp />
      </PersistGate>
    </Provider>
  );
}