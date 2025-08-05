// src/services/InAppPurchaseService.js
import { Platform, Alert } from 'react-native';

// 🔄 COMMENTATO PER DEVELOPMENT - DECOMMENTARE PER PRODUZIONE
// import * as InAppPurchases from 'expo-in-app-purchases';

// 🎭 MOCK TEMPORANEO PER DEVELOPMENT - RIMUOVERE PER PRODUZIONE
const InAppPurchases = {
  IAPResponseCode: {
    OK: 0,
    USER_CANCELED: 1,
    ERROR: 2,
    DEFERRED: 3
  },
  connectAsync: async () => {
    console.log('🎭 Mock IAP: connectAsync');
    return true;
  },
  getProductsAsync: async (productIds) => {
    console.log('🎭 Mock IAP: getProductsAsync', productIds);
    return {
      responseCode: 0,
      results: productIds.map(id => ({
        productId: id,
        price: '€9.99',
        title: 'Prodotto Mock',
        description: 'Descrizione mock per development'
      }))
    };
  },
  purchaseItemAsync: async (productId) => {
    console.log('🎭 Mock IAP: Tentativo acquisto', productId);
    throw new Error('Acquisti non disponibili in development - Usa una build di produzione');
  },
  getPurchaseHistoryAsync: async () => ({
    responseCode: 0,
    results: []
  }),
  setPurchaseListener: (callback) => {
    console.log('🎭 Mock IAP: setPurchaseListener');
    return { remove: () => {} };
  },
  finishTransactionAsync: async () => {
    console.log('🎭 Mock IAP: finishTransactionAsync');
  },
  disconnectAsync: async () => {
    console.log('🎭 Mock IAP: disconnectAsync');
  }
};
// 🎭 FINE MOCK

// Configurazione prodotti - DEVONO corrispondere ESATTAMENTE a App Store Connect / Google Play Console
const PRODUCTS = {
  // Abbonamenti (Auto-Renewable Subscriptions)
  'com.zampapp.subscription.pro': {
    id: 'com.zampapp.subscription.pro',
    type: 'subscription',
    packageType: 'pro',
    defaultPrice: 9.99,
    defaultCurrency: 'EUR'
  },
  'com.zampapp.subscription.premium': {
    id: 'com.zampapp.subscription.premium',
    type: 'subscription',
    packageType: 'premium',
    defaultPrice: 19.99,
    defaultCurrency: 'EUR'
  },
  'com.zampapp.subscription.vip': {
    id: 'com.zampapp.subscription.vip',
    type: 'subscription',
    packageType: 'vip',
    defaultPrice: 29.99,
    defaultCurrency: 'EUR'
  },
  // Acquisti singoli (Consumables)
  'com.zampapp.challenge.single': {
    id: 'com.zampapp.challenge.single',
    type: 'consumable',
    defaultPrice: 4.99,
    defaultCurrency: 'EUR'
  }
};

class InAppPurchaseService {
  constructor() {
    this.isInitialized = false;
    this.products = [];
    this.purchaseListener = null;
    this.purchaseSuccessCallbacks = [];
    this.purchaseErrorCallbacks = [];
    this.purchaseCancelCallbacks = [];
    
    // 🔄 AGGIUNTO PER DEVELOPMENT - RIMUOVERE PER PRODUZIONE
    this.isMockMode = true; // Forza mock mode per development
  }

  /**
   * Verifica se IAP è disponibile sulla piattaforma
   */
  isIAPAvailable() {
    // 🔄 MODIFICATO PER DEVELOPMENT
    if (this.isMockMode) {
      console.log('🎭 Mock Mode attivo - IAP simulato');
      return true;
    }
    // CODICE ORIGINALE
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  /**
   * Inizializza il servizio IAP
   */
  async initialize() {
    try {
      console.log('🛍️ Inizializzazione IAP...');
      
      // 🔄 AGGIUNTO PER DEVELOPMENT
      if (this.isMockMode) {
        console.log('🎭 Inizializzazione Mock IAP');
        this.isInitialized = true;
        // Simula prodotti caricati
        this.products = Object.keys(PRODUCTS).map(id => ({
          productId: id,
          price: `€${PRODUCTS[id].defaultPrice}`,
          title: `${PRODUCTS[id].packageType || 'Challenge'} - Mock`,
          description: 'Prodotto mock per development'
        }));
        return true;
      }
      // FINE MODIFICA DEVELOPMENT
      
      // Verifica che siamo su piattaforma supportata
      if (!this.isIAPAvailable()) {
        console.warn('⚠️ IAP non disponibile su questa piattaforma');
        return false;
      }
      
      // Connetti al servizio IAP nativo
      await InAppPurchases.connectAsync();
      
      // Carica i prodotti disponibili dagli store
      const productIds = Object.keys(PRODUCTS);
      console.log('📦 Caricamento prodotti:', productIds);
      
      const { responseCode, results } = await InAppPurchases.getProductsAsync(productIds);
      
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        this.products = results;
        console.log('✅ Prodotti caricati:', this.products.length);
        this.products.forEach(p => {
          console.log(`  - ${p.productId}: ${p.price}`);
        });
      } else {
        console.error('❌ Errore caricamento prodotti:', responseCode);
      }
      
      this.isInitialized = true;
      
      // Setup listener per eventi di acquisto
      this.setupPurchaseListener();
      
      // Controlla acquisti pendenti (Android)
      if (Platform.OS === 'android') {
        await this.checkPendingPurchases();
      }
      
      return true;
    } catch (error) {
      console.error('❌ Errore inizializzazione IAP:', error);
      this.isInitialized = false;
      
      // 🔄 AGGIUNTO PER DEVELOPMENT
      if (this.isMockMode) {
        console.log('🎭 Fallback a mock mode completo');
        this.isInitialized = true;
        return true;
      }
      // FINE MODIFICA
      
      throw error;
    }
  }

  /**
   * Configura il listener per gli eventi di acquisto
   */
  setupPurchaseListener() {
    // 🔄 AGGIUNTO PER DEVELOPMENT
    if (this.isMockMode) {
      console.log('🎭 Mock listener configurato');
      return;
    }
    // FINE MODIFICA
    
    this.purchaseListener = InAppPurchases.setPurchaseListener(({ 
      responseCode, 
      results, 
      errorCode 
    }) => {
      console.log('🎯 Evento acquisto ricevuto:', responseCode);
      
      switch (responseCode) {
        case InAppPurchases.IAPResponseCode.OK:
          // Acquisto completato con successo
          results.forEach(purchase => {
            console.log('✅ Acquisto completato:', purchase.productId);
            this.notifyPurchaseSuccess(purchase);
          });
          break;
          
        case InAppPurchases.IAPResponseCode.USER_CANCELED:
          // Utente ha annullato
          console.log('❌ Acquisto annullato dall\'utente');
          this.notifyPurchaseCancelled();
          break;
          
        case InAppPurchases.IAPResponseCode.DEFERRED:
          // Acquisto in attesa di approvazione (parental control)
          console.log('⏳ Acquisto in attesa di approvazione');
          Alert.alert(
            'Acquisto in attesa',
            'L\'acquisto richiede l\'approvazione. Riceverai una notifica quando sarà completato.'
          );
          break;
          
        default:
          // Errore generico
          console.error('❌ Errore acquisto:', errorCode);
          this.notifyPurchaseError(errorCode || 'Errore sconosciuto');
      }
    });
  }

  /**
   * Registra un callback per acquisti completati
   */
  setPurchaseListener(callback) {
    this.purchaseSuccessCallbacks.push(callback);
    
    // Ritorna funzione per rimuovere il listener
    return {
      remove: () => {
        this.purchaseSuccessCallbacks = this.purchaseSuccessCallbacks.filter(
          cb => cb !== callback
        );
      }
    };
  }

  /**
   * Acquista un abbonamento
   */
  async purchaseSubscription(packageType) {
    const productId = `com.zampapp.subscription.${packageType}`;
    return this.purchaseProduct(productId);
  }

  /**
   * Acquista una challenge
   */
  async purchaseChallenge(challengeId, metadata = {}) {
    const productId = 'com.zampapp.challenge.single';
    return this.purchaseProduct(productId, { challengeId, ...metadata });
  }

  /**
   * Acquista un prodotto generico
   */
  async purchaseProduct(productId, metadata = {}) {
    // 🔄 AGGIUNTO PER DEVELOPMENT
    if (this.isMockMode) {
      console.log('🎭 Mock acquisto:', productId);
      Alert.alert(
        'Mock Mode',
        'I pagamenti sono disabilitati in development.\nPer testare i pagamenti reali, crea una build di produzione.',
        [{ text: 'OK' }]
      );
      throw new Error('Acquisti non disponibili in development mode');
    }
    // FINE MODIFICA
    
    if (!this.isInitialized) {
      throw new Error('IAP non inizializzato. Chiama initialize() prima.');
    }
    
    try {
      console.log('🛒 Avvio acquisto:', productId);
      
      // Verifica che il prodotto esista
      const product = this.products.find(p => p.productId === productId);
      if (!product) {
        throw new Error(`Prodotto ${productId} non trovato`);
      }
      
      console.log('💰 Prezzo:', product.price);
      
      // Avvia l'acquisto
      if (Platform.OS === 'android' && metadata) {
        // Android supporta developerPayload
        await InAppPurchases.purchaseItemAsync(productId, {
          developerPayload: JSON.stringify(metadata)
        });
      } else {
        // iOS non supporta metadata diretti
        await InAppPurchases.purchaseItemAsync(productId);
      }
      
      // Il risultato sarà gestito dal purchaseListener
      return { started: true };
      
    } catch (error) {
      console.error('❌ Errore avvio acquisto:', error);
      throw error;
    }
  }

  /**
   * Completa una transazione (importante per consumables)
   */
  async finishTransaction(purchase, consume = true) {
    // 🔄 AGGIUNTO PER DEVELOPMENT
    if (this.isMockMode) {
      console.log('🎭 Mock finishTransaction');
      return;
    }
    // FINE MODIFICA
    
    try {
      console.log('🏁 Completamento transazione:', purchase.transactionId);
      
      await InAppPurchases.finishTransactionAsync(
        purchase.transactionId,
        consume // true per consumables, false per non-consumables
      );
      
      console.log('✅ Transazione completata');
    } catch (error) {
      console.error('❌ Errore completamento transazione:', error);
      throw error;
    }
  }

  /**
   * Ripristina acquisti precedenti
   */
  async restorePurchases() {
    // 🔄 AGGIUNTO PER DEVELOPMENT
    if (this.isMockMode) {
      console.log('🎭 Mock restore purchases');
      Alert.alert(
        'Mock Mode',
        'Ripristino acquisti simulato.\nNessun acquisto da ripristinare in development.',
        [{ text: 'OK' }]
      );
      return [];
    }
    // FINE MODIFICA
    
    if (!this.isInitialized) {
      throw new Error('IAP non inizializzato');
    }
    
    try {
      console.log('🔄 Ripristino acquisti in corso...');
      
      const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();
      
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        console.log(`📦 ${results.length} acquisti trovati`);
        
        // Filtra solo subscriptions attive
        const activeSubscriptions = results.filter(purchase => {
          const product = PRODUCTS[purchase.productId];
          return product && product.type === 'subscription';
        });
        
        if (activeSubscriptions.length > 0) {
          Alert.alert(
            'Ripristino completato',
            `${activeSubscriptions.length} abbonamenti ripristinati`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Nessun acquisto',
            'Non sono stati trovati abbonamenti da ripristinare',
            [{ text: 'OK' }]
          );
        }
        
        return activeSubscriptions;
      } else {
        throw new Error('Errore nel ripristino');
      }
    } catch (error) {
      console.error('❌ Errore ripristino:', error);
      Alert.alert('Errore', 'Impossibile ripristinare gli acquisti');
      throw error;
    }
  }

  /**
   * Verifica acquisti pendenti (Android)
   */
  async checkPendingPurchases() {
    // 🔄 AGGIUNTO PER DEVELOPMENT
    if (this.isMockMode) {
      console.log('🎭 Mock check pending purchases');
      return;
    }
    // FINE MODIFICA
    
    try {
      console.log('🔍 Verifica acquisti pendenti...');
      
      const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();
      
      if (responseCode === InAppPurchases.IAPResponseCode.OK && results.length > 0) {
        console.log(`⏳ ${results.length} acquisti da verificare`);
        
        // Qui dovresti validare con il tuo backend
        for (const purchase of results) {
          if (!purchase.acknowledged) {
            console.log('📌 Acquisto non confermato:', purchase.productId);
            // Invia al backend per validazione
          }
        }
      }
    } catch (error) {
      console.error('❌ Errore verifica pendenti:', error);
    }
  }

  /**
   * Ottieni i prodotti disponibili
   */
  getProducts() {
    return this.products;
  }

  /**
   * Ottieni un prodotto specifico
   */
  getProduct(productId) {
    return this.products.find(p => p.productId === productId);
  }

  /**
   * Ottieni il prezzo localizzato
   */
  getLocalizedPrice(productId) {
    const product = this.getProduct(productId);
    if (product) {
      return product.price; // Già formattato con valuta locale
    }
    
    // Fallback
    const config = PRODUCTS[productId];
    return config ? `€${config.defaultPrice}` : 'N/A';
  }

  /**
   * Notifica successo acquisto
   */
  notifyPurchaseSuccess(purchase) {
    this.purchaseSuccessCallbacks.forEach(callback => {
      try {
        callback(purchase);
      } catch (error) {
        console.error('Errore in callback success:', error);
      }
    });
  }

  /**
   * Notifica cancellazione
   */
  notifyPurchaseCancelled() {
    this.purchaseCancelCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Errore in callback cancel:', error);
      }
    });
  }

  /**
   * Notifica errore
   */
  notifyPurchaseError(error) {
    this.purchaseErrorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (error) {
        console.error('Errore in callback error:', error);
      }
    });
  }

  /**
   * Disconnetti il servizio
   */
  async disconnect() {
    try {
      console.log('👋 Disconnessione IAP...');
      
      // 🔄 AGGIUNTO PER DEVELOPMENT
      if (this.isMockMode) {
        console.log('🎭 Mock disconnect');
        this.isInitialized = false;
        this.products = [];
        return;
      }
      // FINE MODIFICA
      
      if (this.purchaseListener) {
        this.purchaseListener.remove();
        this.purchaseListener = null;
      }
      
      if (this.isInitialized) {
        await InAppPurchases.disconnectAsync();
      }
      
      this.isInitialized = false;
      this.products = [];
      this.purchaseSuccessCallbacks = [];
      this.purchaseErrorCallbacks = [];
      this.purchaseCancelCallbacks = [];
      
      console.log('✅ IAP disconnesso');
    } catch (error) {
      console.error('❌ Errore disconnessione:', error);
    }
  }

  /**
   * Debug info
   */
  getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      platform: Platform.OS,
      productsLoaded: this.products.length,
      isMockMode: this.isMockMode, // 🔄 AGGIUNTO
      products: this.products.map(p => ({
        id: p.productId,
        price: p.price,
        type: PRODUCTS[p.productId]?.type || 'unknown'
      }))
    };
  }
}

// Esporta istanza singleton
export default new InAppPurchaseService();

// 📝 NOTE PER LA PRODUZIONE:
// 1. Decommentare l'import di expo-in-app-purchases (riga 4)
// 2. Rimuovere tutto il mock di InAppPurchases (righe 7-36)
// 3. Rimuovere this.isMockMode = true dal constructor (riga 89)
// 4. Rimuovere tutti i blocchi "AGGIUNTO PER DEVELOPMENT"
// 5. Usare Expo SDK 51 con expo-in-app-purchases installato
// 6. Fare una build con EAS per testare i pagamenti reali