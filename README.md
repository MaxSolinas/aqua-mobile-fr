# Aqua Mobile FR — App iOS + Android

Application mobile cross-platform pour Aqua Purify : **diagnostic qualité de l'eau** (B2C) + **outil terrain dealer** (Mode pro).

Frontale du widget [`aqua-water-score-fr`](https://github.com/MaxSolinas/aqua-water-score-fr) — partage 100% de la logique métier (seuils, scoring, recommandations, catalogue produits).

---

## 🚀 Test en 5 minutes avec Expo Go

**Aucun build natif requis.** Pas de Xcode, pas d'Android Studio.

### 1. Installer Node 18+ et Expo CLI
```bash
# macOS / Linux
brew install node
# Windows : installeur node depuis nodejs.org

# Puis :
npm install -g expo
```

### 2. Cloner ce repo et installer
```bash
git clone https://github.com/MaxSolinas/aqua-mobile-fr.git
cd aqua-mobile-fr
npm install
```

### 3. Lancer
```bash
npx expo start
```

Un **QR code** s'affiche dans le terminal.

### 4. Sur ton téléphone
- **iPhone** : ouvrir l'**app Caméra** native, scanner le QR → ça ouvre Expo Go automatiquement
- **Android** : installer **Expo Go** depuis Play Store, scanner le QR depuis l'app

→ L'app se charge sur ton téléphone en **30 secondes**, en live.

Toute modification du code se voit instantanément (hot reload).

---

## 📋 Comptes de démo Mode Pro

| Email | Mot de passe | Rôle |
|---|---|---|
| `max@aquapurify.lu` | `demo` | Admin (siège) |
| `dealer@premier.fr` | `demo` | Dealer Lorraine |

Ces comptes sont **locaux** (codés en dur dans `DealerLoginScreen.js`). Pour la production, brancher Supabase Auth.

---

## 🏗️ Structure

```
aqua-mobile-fr/
├── App.js                      # Point d'entrée, navigation tabs
├── app.json                    # Config Expo (permissions, bundle ids)
├── package.json                # Dépendances Expo SDK 51
├── babel.config.js
├── src/
│   ├── assets/                 # PNG icons + splash (placeholders unis)
│   ├── components/
│   │   ├── Gauge.js            # Jauge animée 0-100
│   │   ├── SubScores.js        # 5 sous-scores
│   │   ├── ParamGroup.js       # Détail par catégorie
│   │   └── RecoCard.js         # Carte recommandation produit
│   ├── lib/
│   │   ├── constants.js        # SEUILS réglementaires + PRODUITS
│   │   ├── hubeau.js           # Client API Hub'Eau + geo.api.gouv.fr
│   │   ├── scoring.js          # Moteur de score
│   │   └── recommendations.js  # Moteur de reco produit
│   ├── screens/
│   │   ├── SearchScreen.js     # B2C : recherche + géoloc
│   │   ├── ResultScreen.js     # B2C : résultat + PDF + lead
│   │   ├── DealerLoginScreen.js
│   │   └── DealerHomeScreen.js # Dashboard + leads + calc + devis
│   └── styles/theme.js         # Design tokens (alignés sur le widget web)
└── README.md
```

---

## ✅ Fonctionnalités v0.1 (cette version)

### Mode B2C (onglet "Mon eau")
- ✅ Recherche commune par nom ou code postal (autocomplete `geo.api.gouv.fr`)
- ✅ Géolocalisation auto via `expo-location`
- ✅ Boutons rapides (Nancy, Metz, Paris, Marseille, Lille, Lyon)
- ✅ Score global 0-100 + lettre A-E + jauge animée
- ✅ 5 sous-scores (Microbio / Chimique / Métaux / Émergents / Confort)
- ✅ Verdict textuel vulgarisé
- ✅ Détail par catégorie de paramètre avec statut visuel
- ✅ Recommandations Kinetico/Viqua priorisées (1/2/3)
- ✅ Génération PDF (via `expo-print` + `expo-sharing`)
- ✅ Formulaire lead (envoi console.log pour démo — à brancher sur n8n)
- ✅ Bouton "Appeler un expert" (lien `tel:` natif)

### Mode Pro (onglet "Pro")
- ✅ Login email/password (local, à brancher Supabase)
- ✅ Dashboard avec stats (3 nouveaux leads, 12 ce mois, 34% conversion — démo)
- ✅ Liste de leads (3 fictifs) avec status, score, actions appel/email
- ✅ Calculateur dimensionnement (foyer × dureté → produit Kinetico)
- ✅ Génération de devis PDF Aqua-branded (numéro, client, produit, prix HT/TTC, certifications)
- ✅ Partage natif du PDF (mail, WhatsApp, AirDrop, etc.)

---

## 🛣️ Roadmap

### v0.2 (court terme — 1 mois après v0.1)
- [ ] Brancher Supabase Auth (vraie auth dealer + RLS)
- [ ] Webhook n8n pour lead capture vers Odoo CRM
- [ ] Cache offline des analyses (AsyncStorage) pour mode terrain
- [ ] Notifications push (Expo Push) pour nouveaux leads attribués
- [ ] Mode sombre

### v0.3 (3 mois)
- [ ] Vraie signature électronique (build natif EAS + `react-native-signature-canvas`)
- [ ] Photos client (plomberie, robinetterie) avec upload Supabase Storage
- [ ] Carte des leads sur la région
- [ ] Compare scores commune voisines

### v1.0 (publication stores)
- [ ] Build EAS (`eas build`) pour iOS + Android
- [ ] Soumission App Store + Google Play
- [ ] Onboarding 3 écrans
- [ ] Internationalisation EN/DE/LU (pour marché transfrontalier)

---

## 📱 Publication App Store / Google Play (futur)

Quand l'app sera mature, utiliser **EAS Build** (Expo Application Services). Pas de Mac ni Android Studio requis : le build tourne dans le cloud Expo.

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios     # → fichier .ipa cloud
eas build --platform android # → fichier .aab cloud
```

**Comptes requis** :
- **Apple Developer Program** : 99 USD/an (organisation), inclut TestFlight (10 000 testeurs externes max)
- **Google Play Console** : 25 USD frais unique d'inscription

**Coût EAS Build** : Free tier inclut 30 builds/mois (suffisant pour usage interne). Tier "Production" 99 USD/mois si volume.

---

## 🔌 Branchement Production

### 1. Webhook n8n pour lead capture

Dans `App.js` ou directement dans `ResultScreen.js`, remplacer le `console.log('AQUA LEAD →', payload)` par :

```javascript
await fetch('https://n8n.pax-solinas.com/webhook/aqua-mobile-lead', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
```

Workflow n8n suggéré :
```
[Webhook] → [Enrichir BAN] → [Odoo crm.lead.create]
         → [Email Brevo] → [Slack notif]
```

### 2. Supabase Auth (dealers)

Remplacer `DEMO_ACCOUNTS` dans `DealerLoginScreen.js` par :

```javascript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(URL, ANON_KEY);

async function tryLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) Alert.alert('Erreur', error.message);
  else onLogin(data.user);
}
```

Et configurer **Row Level Security** dans Supabase pour limiter chaque dealer à ses propres leads.

---

## 🐛 Limites connues v0.1

1. **Pas de SVG natif** — la jauge utilise des bordures CSS (rendu Android légèrement différent d'iOS). Pour v1 production : ajouter `react-native-svg` et reproduire le rendu du widget web.
2. **Lead capture log console** — à brancher webhook n8n avant publication
3. **Auth dealer en clair** — comptes locaux pour démo, **NE PAS PUBLIER tel quel**
4. **Pas de signature électronique tactile** — nécessite build EAS natif
5. **Pas de cache offline** — chaque consultation refait des appels Hub'Eau (acceptable en démo, à améliorer pour usage terrain)

---

## 📋 Conformité

- **RGPD** : aucun cookie, géoloc avec consentement explicite, lead envoyé sur action utilisateur
- **iOS** : `NSLocationWhenInUseUsageDescription` configurée dans `app.json`
- **Android** : `ACCESS_FINE_LOCATION` configurée
- **Licence données** : Etalab Open License 2.0 (mention dans footer écran d'accueil)

---

## 📝 Licence

MIT — utilisation libre y compris commerciale.
Code © 2026 Aqua Purify S.à r.l.-S.
Données © Ministère de la Santé / SISE-Eaux — Licence Ouverte Etalab 2.0.

---

## 🆘 Support

- Bug / feature : ouvrir une issue
- Intégration : contact@aquapurify.lu
