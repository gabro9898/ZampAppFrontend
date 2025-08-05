// src/screens/PrivacyScreen.js
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function PrivacyScreen() {
  const navigation = useNavigation();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={{
          backgroundColor: '#030213',
          padding: 20,
          paddingTop: 40,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24
        }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginBottom: 20 }}
          >
            <Text style={{ color: 'white', fontSize: 16 }}>← Indietro</Text>
          </TouchableOpacity>
          
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 8
          }}>
            Privacy Policy
          </Text>
          <Text style={{
            fontSize: 16,
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
          </Text>
        </View>
        
        <View style={{ padding: 16 }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4
          }}>
            <Section
              title="1. Informazioni che Raccogliamo"
              content="Raccogliamo le seguenti informazioni:\n\n• Dati di registrazione (nome, email, data di nascita)\n• Dati di utilizzo dell'app\n• Risultati delle challenge\n• Informazioni sui pagamenti (gestite da provider terzi)\n• Token per notifiche push"
            />
            
            <Section
              title="2. Come Utilizziamo le Informazioni"
              content="Utilizziamo i tuoi dati per:\n\n• Fornire e migliorare i nostri servizi\n• Gestire le challenge e i premi\n• Inviare notifiche importanti\n• Personalizzare l'esperienza utente\n• Prevenire frodi e abusi"
            />
            
            <Section
              title="3. Condivisione delle Informazioni"
              content="NON vendiamo i tuoi dati personali. Condividiamo informazioni solo con:\n\n• Provider di pagamento (Stripe, PayPal)\n• Servizi di analytics (in forma anonima)\n• Autorità competenti se richiesto per legge"
            />
            
            <Section
              title="4. Sicurezza dei Dati"
              content="Implementiamo misure di sicurezza appropriate:\n\n• Crittografia dei dati sensibili\n• Accesso limitato ai dati personali\n• Monitoraggio regolare della sicurezza\n• Conformità GDPR"
            />
            
            <Section
              title="5. I Tuoi Diritti"
              content="Hai il diritto di:\n\n• Accedere ai tuoi dati\n• Correggere informazioni errate\n• Richiedere la cancellazione dei dati\n• Opporti al trattamento\n• Portabilità dei dati\n• Revocare il consenso"
            />
            
            <Section
              title="6. Conservazione dei Dati"
              content="Conserviamo i tuoi dati per:\n\n• Account attivi: durata dell'account\n• Dati di gioco: 2 anni dall'ultima attività\n• Dati di pagamento: secondo requisiti legali\n• Dopo cancellazione: massimo 30 giorni"
            />
            
            <Section
              title="7. Cookie e Tecnologie Simili"
              content="Utilizziamo:\n\n• Cookie essenziali per il funzionamento\n• Cookie di analytics (anonimi)\n• Token di autenticazione\n• Local storage per preferenze"
            />
            
            <Section
              title="8. Minori"
              content="Il servizio è destinato a utenti di almeno 18 anni. Non raccogliamo consapevolmente dati di minori. Se vieni a conoscenza che un minore ci ha fornito dati, contattaci immediatamente."
            />
            
            <Section
              title="9. Modifiche alla Privacy Policy"
              content="Potremmo aggiornare questa policy periodicamente. Ti notificheremo di modifiche significative tramite:\n\n• Notifica in-app\n• Email all'indirizzo registrato\n• Avviso sul nostro sito web"
            />
            
            <Section
              title="10. Contatti Privacy"
              content="Per questioni relative alla privacy:\n\nData Protection Officer\nEmail: privacy@challengeapp.com\nTelefono: +39 02 1234567\n\nGarante Privacy\nPiazza Venezia 11\n00187 Roma\nwww.garanteprivacy.it"
              isLast
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, content, isLast }) {
  return (
    <View style={{
      marginBottom: isLast ? 0 : 20,
      paddingBottom: isLast ? 0 : 20,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: '#f3f4f6'
    }}>
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: '#030213',
        marginBottom: 8
      }}>
        {title}
      </Text>
      <Text style={{
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 22
      }}>
        {content}
      </Text>
    </View>
  );
}