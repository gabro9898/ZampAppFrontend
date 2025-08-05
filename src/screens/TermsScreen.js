// src/screens/TermsScreen.js
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function TermsScreen() {
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
            Termini e Condizioni
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
              title="1. Accettazione dei Termini"
              content="Utilizzando Challenge App, accetti di essere vincolato da questi termini di servizio. Se non accetti questi termini, non utilizzare l'app."
            />
            
            <Section
              title="2. Descrizione del Servizio"
              content="Challenge App è una piattaforma che permette agli utenti di partecipare a sfide di gioco e vincere premi. Il servizio include challenge gratuite e a pagamento."
            />
            
            <Section
              title="3. Account Utente"
              content="Per utilizzare l'app, devi creare un account fornendo informazioni accurate e complete. Sei responsabile della sicurezza del tuo account e di tutte le attività che si verificano sotto il tuo account."
            />
            
            <Section
              title="4. Challenge e Premi"
              content="• Le challenge hanno regole specifiche che devono essere rispettate\n• I premi sono assegnati secondo le classifiche finali\n• L'azienda si riserva il diritto di verificare i risultati\n• I premi saranno erogati entro 30 giorni dalla fine della challenge"
            />
            
            <Section
              title="5. Pagamenti e Abbonamenti"
              content="• Gli abbonamenti si rinnovano automaticamente\n• Puoi cancellare in qualsiasi momento\n• I pagamenti sono gestiti tramite App Store o Google Play\n• Non sono previsti rimborsi per periodi parziali"
            />
            
            <Section
              title="6. Comportamento Utente"
              content="È vietato:\n• Utilizzare trucchi o bot\n• Creare account multipli\n• Interferire con il normale funzionamento dell'app\n• Violare leggi locali o internazionali"
            />
            
            <Section
              title="7. Proprietà Intellettuale"
              content="Tutti i contenuti dell'app, inclusi testi, grafica, loghi e software, sono di proprietà di Challenge App o dei suoi licenziatari e sono protetti dalle leggi sulla proprietà intellettuale."
            />
            
            <Section
              title="8. Privacy"
              content="L'utilizzo dei tuoi dati personali è regolato dalla nostra Privacy Policy, che costituisce parte integrante di questi termini."
            />
            
            <Section
              title="9. Limitazione di Responsabilità"
              content="Challenge App non sarà responsabile per danni indiretti, incidentali, speciali o consequenziali derivanti dall'uso o dall'impossibilità di utilizzare il servizio."
            />
            
            <Section
              title="10. Modifiche ai Termini"
              content="Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. Le modifiche saranno effettive immediatamente dopo la pubblicazione nell'app."
            />
            
            <Section
              title="11. Giurisdizione"
              content="Questi termini sono regolati dalle leggi italiane. Qualsiasi controversia sarà risolta presso i tribunali competenti in Italia."
            />
            
            <Section
              title="12. Contatti"
              content="Per domande sui termini di servizio:\n\nEmail: legal@challengeapp.com\nTelefono: +39 02 1234567\nIndirizzo: Via Example 123, 20100 Milano, Italia"
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