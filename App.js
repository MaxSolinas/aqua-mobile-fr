import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SearchScreen from './src/screens/SearchScreen';
import ResultScreen from './src/screens/ResultScreen';
import DealerLoginScreen from './src/screens/DealerLoginScreen';
import DealerHomeScreen from './src/screens/DealerHomeScreen';
import { theme } from './src/styles/theme';
import { fetchAnalyses, fetchUdi } from './src/lib/hubeau';
import { aggregate, computeScore } from './src/lib/scoring';

export default function App() {
  // Tabs
  const [tab, setTab] = useState('consumer'); // 'consumer' | 'dealer'

  // Consumer flow
  const [screen, setScreen] = useState('search');
  const [commune, setCommune] = useState(null);
  const [score, setScore] = useState(null);
  const [udi, setUdi] = useState([]);
  const [error, setError] = useState(null);

  // Dealer flow
  const [dealer, setDealer] = useState(null);
  const [dealerLoading, setDealerLoading] = useState(true);

  // Restaure dealer session si présente
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('@aqua/dealer');
        if (raw) setDealer(JSON.parse(raw));
      } catch (_) {}
      setDealerLoading(false);
    })();
  }, []);

  async function analyze(c) {
    setCommune(c);
    setScreen('loading');
    setError(null);
    try {
      const [raw, udiData] = await Promise.all([
        fetchAnalyses(c.code),
        fetchUdi(c.code),
      ]);
      if (!raw || raw.length === 0) {
        setError(`Aucune analyse Hub'Eau disponible pour ${c.nom}.`);
        setScreen('search');
        return;
      }
      const agg = aggregate(raw);
      const sc = computeScore(agg);
      setScore(sc);
      setUdi(udiData);
      setScreen('result');
    } catch (e) {
      setError(`Erreur : ${e.message}`);
      setScreen('search');
    }
  }

  function back() {
    setScreen('search');
    setScore(null);
    setUdi([]);
  }

  async function loginDealer(profile) {
    setDealer(profile);
    await AsyncStorage.setItem('@aqua/dealer', JSON.stringify(profile));
  }

  async function logoutDealer() {
    await AsyncStorage.removeItem('@aqua/dealer');
    setDealer(null);
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <StatusBar style="light" backgroundColor={theme.colors.navy} />

        {/* Contenu */}
        <View style={styles.body}>
          {tab === 'consumer' && (
            <>
              {screen === 'search' && (
                <SearchScreen onAnalyze={analyze} error={error} />
              )}
              {screen === 'loading' && (
                <View style={styles.loading}>
                  <ActivityIndicator size="large" color={theme.colors.cyan} />
                  <Text style={styles.loadingTxt}>Récupération des analyses…</Text>
                </View>
              )}
              {screen === 'result' && score && commune && (
                <ResultScreen
                  commune={commune}
                  score={score}
                  udi={udi}
                  onBack={back}
                />
              )}
            </>
          )}

          {tab === 'dealer' && (
            <>
              {dealerLoading ? (
                <View style={styles.loading}>
                  <ActivityIndicator color={theme.colors.cyan} />
                </View>
              ) : dealer ? (
                <DealerHomeScreen dealer={dealer} onLogout={logoutDealer} onAnalyzeCommune={analyze} setConsumerTab={() => setTab('consumer')} />
              ) : (
                <DealerLoginScreen onLogin={loginDealer} />
              )}
            </>
          )}
        </View>

        {/* Tab bar */}
        <SafeAreaView edges={['bottom']} style={styles.tabBarWrap}>
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, tab === 'consumer' && styles.tabActive]}
              onPress={() => setTab('consumer')}
              activeOpacity={0.7}>
              <Text style={[styles.tabIcon, tab === 'consumer' && styles.tabIconActive]}>💧</Text>
              <Text style={[styles.tabLabel, tab === 'consumer' && styles.tabLabelActive]}>Mon eau</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, tab === 'dealer' && styles.tabActive]}
              onPress={() => setTab('dealer')}
              activeOpacity={0.7}>
              <Text style={[styles.tabIcon, tab === 'dealer' && styles.tabIconActive]}>👤</Text>
              <Text style={[styles.tabLabel, tab === 'dealer' && styles.tabLabelActive]}>
                {dealer ? 'Espace pro' : 'Pro'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  body: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingTxt: { marginTop: 16, color: theme.colors.textSoft, fontSize: 14 },
  tabBarWrap: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: theme.colors.border },
  tabBar: { flexDirection: 'row', height: 56 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabActive: {},
  tabIcon: { fontSize: 22, opacity: 0.4 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '500' },
  tabLabelActive: { color: theme.colors.cyanDeep, fontWeight: '700' },
});
