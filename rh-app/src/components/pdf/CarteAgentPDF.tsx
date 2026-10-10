import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Svg, Path, Rect } from '@react-pdf/renderer';
import logo from '../../assets/logo.png';

export interface CarteAgentCardProps {
  agent: {
    nom?: string;
    postnom?: string;
    prenom?: string;
    matricule?: string;
    gradeNom?: string;
    gradeSigle?: string;
    fonctionNom?: string;
    directionNom?: string;
    sexe?: string;
    dateNaissance?: string;
  };
  carte: {
    numeroCarte?: string;
    dateValidation?: string;
    dateReception?: string;
    dateDemande?: string;
  };
  photoBase64?: string;
  qrDataUrl?: string;
}

// Palette institutionnelle RDC
const BLUE = '#1E3A8A';
const BLUE2 = '#2563EB';
const GOLD = '#F59E0B';
const RED = '#CE1126';
const SKY = '#007FFF';
const YELLOW = '#FCD116';
const INK = '#0F172A';

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 22 },
  faceLabel: { fontSize: 8, color: '#94A3B8', fontWeight: 'bold', letterSpacing: 2, marginBottom: 4, textAlign: 'center' },
  spacer: { height: 26 },
  cut: {
    width: 246, height: 157, borderWidth: 0.5, borderColor: '#E2E8F0', borderStyle: 'dashed',
    borderRadius: 9, alignItems: 'center', justifyContent: 'center',
  },
  card: {
    width: 242, height: 153, backgroundColor: '#FCFDFF', borderRadius: 8,
    borderWidth: 1.2, borderColor: BLUE, overflow: 'hidden', position: 'relative',
  },

  // En-tête
  header: { height: 28, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, backgroundColor: BLUE },
  headerAccent: { height: 2, flexDirection: 'row' },
  accentBlue: { flex: 1, backgroundColor: SKY },
  accentYellow: { flex: 1, backgroundColor: YELLOW },
  accentRed: { flex: 1, backgroundColor: RED },
  logoBox: { width: 20, height: 20, borderRadius: 3, backgroundColor: '#FFFFFF', padding: 1.5, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 17, height: 17 },
  headerText: { flex: 1, marginHorizontal: 6 },
  headerTitle: { fontSize: 5.6, color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center', letterSpacing: 0.3 },
  headerSubtitle: { fontSize: 3.4, color: '#C7D2FE', textAlign: 'center', marginTop: 0.5 },
  flag: { width: 22, height: 15, borderRadius: 1.5, borderWidth: 0.4, borderColor: '#FFFFFF' },

  // Corps
  body: { flex: 1, flexDirection: 'row', paddingHorizontal: 8, paddingTop: 7, paddingBottom: 4, alignItems: 'center' },
  leftCol: { width: 62, alignItems: 'center' },
  photoWrap: { width: 54, height: 66, borderWidth: 1, borderColor: BLUE, borderRadius: 3, overflow: 'hidden', backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { fontSize: 5.5, color: '#64748B', textAlign: 'center' },
  chip: { width: 26, height: 19, borderRadius: 2.5, borderWidth: 0.6, borderColor: '#B45309', backgroundColor: '#FCD34D', marginTop: 5, alignItems: 'center', justifyContent: 'center' },

  info: { flex: 1, marginLeft: 8, justifyContent: 'center' },
  name: { fontSize: 10.5, fontWeight: 'bold', color: INK, letterSpacing: 0.2 },
  nameSmall: { fontSize: 8.5, color: '#1E293B', marginTop: 0.5 },
  fonction: { fontSize: 5.6, color: BLUE2, fontWeight: 'bold', marginTop: 2, textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 3 },
  infoRow: { flexDirection: 'row', marginBottom: 1.6 },
  label: { fontSize: 5.2, fontWeight: 'bold', color: '#64748B', width: 42 },
  value: { fontSize: 5.4, color: INK, flex: 1 },

  // MRZ
  mrz: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#EEF2F7', borderTopWidth: 0.6, borderTopColor: '#CBD5E1', paddingHorizontal: 8, paddingVertical: 2 },
  mrzText: { fontFamily: 'Courier', fontSize: 5, color: '#334155', letterSpacing: 0.3 },

  // Sécurité
  securityStripe: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, backgroundColor: RED, borderLeftWidth: 1, borderLeftColor: GOLD },
  watermark: { position: 'absolute', top: 58, left: 26, opacity: 0.04, transform: 'rotate(-28deg)', fontSize: 24, fontWeight: 'bold', color: BLUE, width: 190, textAlign: 'center', letterSpacing: 2 },

  rightCol: { alignItems: 'center', marginLeft: 6 },
  qrBoxSm: { width: 40, height: 40, backgroundColor: '#FFFFFF', padding: 2, borderWidth: 0.5, borderColor: '#CBD5E1', borderRadius: 2 },
  qr: { width: '100%', height: '100%' },
  qrPlaceholder: { fontSize: 5, color: '#94A3B8', textAlign: 'center' },
  qrCaption: { fontSize: 3.8, color: '#94A3B8', marginTop: 2, textAlign: 'center' },

  // Verso
  magStripe: { height: 14, backgroundColor: '#0B1220' },
  versoBody: { flex: 1, flexDirection: 'row', paddingHorizontal: 10, paddingTop: 6, paddingBottom: 6 },
  versoText: { flex: 1, paddingRight: 8 },
  versoTitle: { fontSize: 6.2, fontWeight: 'bold', color: BLUE, marginBottom: 3 },
  legal: { fontSize: 4.4, color: '#334155', lineHeight: 1.5, marginBottom: 2.5 },
  contactRow: { flexDirection: 'row', marginBottom: 1.1 },
  contactLabel: { fontSize: 4.4, fontWeight: 'bold', color: '#64748B', width: 42 },
  contactValue: { fontSize: 4.4, color: INK, flex: 1 },
  versoRight: { width: 70, alignItems: 'center', justifyContent: 'space-between' },
  qrBoxBig: { width: 52, height: 52, backgroundColor: '#FFFFFF', padding: 2, borderWidth: 0.5, borderColor: '#CBD5E1', borderRadius: 2 },
  barcode: { flexDirection: 'row', alignItems: 'flex-end', height: 12, marginTop: 2 },
  bar: { backgroundColor: '#0F172A', marginRight: 0.7 },
  signLine: { borderTopWidth: 0.7, borderTopColor: '#94A3B8', width: 62, marginTop: 3, paddingTop: 1 },
  signText: { fontSize: 3.8, color: '#64748B', textAlign: 'center' },
});

const pad = (s: string, n: number) => (s + '<'.repeat(n)).slice(0, n);
const clean = (s?: string) => (s || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/ /g, '<');

// Drapeau de la RDC (bleu ciel, bande rouge bordée de jaune, étoile jaune)
const DrcFlag = () => (
  <Svg style={styles.flag} viewBox="0 0 30 20">
    <Rect x="0" y="0" width="30" height="20" fill="#007FFF" />
    <Path d="M0 20 L30 0" stroke="#FCD116" strokeWidth="7" />
    <Path d="M0 20 L30 0" stroke="#CE1126" strokeWidth="4" />
    <Path
      d="M6 1.5 L6.67 3.57 L8.85 3.57 L7.16 4.9 L7.76 6.93 L6 5.65 L4.24 6.93 L4.84 4.9 L3.15 3.57 L5.33 3.57 Z"
      fill="#FCD116"
    />
  </Svg>
);

const Recto: React.FC<CarteAgentCardProps> = ({ agent, carte, photoBase64, qrDataUrl }) => {
  const fullName = `${agent.nom || ''} ${agent.postnom || ''}`.trim();
  const numero = carte.numeroCarte || '—';
  const etablie = carte.dateValidation || carte.dateReception || carte.dateDemande || '';
  const mrz1 = pad(`CDDGRAD<<${clean(agent.nom)}<<${clean(agent.postnom)}<<${clean(agent.prenom)}`, 44);
  const mrz2 = pad(`${(agent.matricule || 'DGR000000').toUpperCase()}<7CD${(agent.dateNaissance || '').replace(/-/g, '')}${agent.sexe || 'X'}<<<<<<<<<<<<<<<<`, 44);

  return (
    <View style={styles.cut}>
      <View style={styles.card}>
        <Text style={styles.watermark}>DGRAD</Text>
        <View style={styles.securityStripe} />

        <View style={styles.header}>
          <View style={styles.logoBox}><Image src={logo} style={styles.logo} /></View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</Text>
            <Text style={styles.headerSubtitle}>DGRAD — Direction Générale des Recettes Administratives, Judiciaires, Domaniales et de Participations</Text>
          </View>
          <DrcFlag />
        </View>
        <View style={styles.headerAccent}>
          <View style={styles.accentBlue} /><View style={styles.accentYellow} /><View style={styles.accentRed} />
        </View>

        <View style={styles.body}>
          <View style={styles.leftCol}>
            <View style={styles.photoWrap}>
              {photoBase64 ? <Image src={photoBase64} style={styles.photo} /> : <Text style={styles.photoPlaceholder}>PHOTO</Text>}
            </View>
            <View style={styles.chip}>
              <Svg width={22} height={15} viewBox="0 0 20 14">
                <Rect x="0" y="0" width="20" height="14" rx="2" fill="none" stroke="#B45309" strokeWidth="0.6" />
                <Path d="M6 0 V14 M13 0 V14 M0 7 H20" stroke="#B45309" strokeWidth="0.6" />
              </Svg>
            </View>
          </View>

          <View style={styles.info}>
            <Text style={styles.name}>{fullName || 'NOM POSTNOM'}</Text>
            <Text style={styles.nameSmall}>{agent.prenom || ''}</Text>
            <Text style={styles.fonction}>{agent.fonctionNom || 'Fonction'}</Text>
            <View style={styles.divider} />
            <View style={styles.infoRow}><Text style={styles.label}>Matricule</Text><Text style={styles.value}>{agent.matricule || '—'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>Grade</Text><Text style={styles.value}>{agent.gradeNom || agent.gradeSigle || '—'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>Direction</Text><Text style={styles.value}>{agent.directionNom || '—'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>N° carte</Text><Text style={styles.value}>{numero}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>Établie le</Text><Text style={styles.value}>{etablie || '—'}</Text></View>
          </View>

          <View style={styles.rightCol}>
            <View style={styles.qrBoxSm}>
              {qrDataUrl ? <Image src={qrDataUrl} style={styles.qr} /> : <Text style={styles.qrPlaceholder}>QR</Text>}
            </View>
            <Text style={styles.qrCaption}>Vérification</Text>
          </View>
        </View>

        <View style={styles.mrz}>
          <Text style={styles.mrzText}>{mrz1}</Text>
          <Text style={styles.mrzText}>{mrz2}</Text>
        </View>
      </View>
    </View>
  );
};

const Verso: React.FC<CarteAgentCardProps> = ({ carte, qrDataUrl }) => {
  const numero = carte.numeroCarte || '—';
  const bars = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2];
  return (
    <View style={styles.cut}>
      <View style={styles.card}>
        <View style={styles.magStripe} />
        <View style={styles.versoBody}>
          <View style={styles.versoText}>
            <Text style={styles.versoTitle}>CARTE PROFESSIONNELLE DGRAD</Text>
            <Text style={styles.legal}>
              Cette carte est la propriété de la Direction Générale des Recettes Administratives, Judiciaires,
              Domaniales et de Participations (DGRAD). Elle est strictement personnelle et non transférable.
              Elle doit être présentée à toute réquisition des agents habilités.
            </Text>
            <Text style={styles.legal}>
              En cas de perte ou de vol, informez immédiatement la Direction des Ressources Humaines.
            </Text>
            <View style={styles.contactRow}><Text style={styles.contactLabel}>Adresse</Text><Text style={styles.contactValue}>Kinshasa, RDC</Text></View>
            <View style={styles.contactRow}><Text style={styles.contactLabel}>Téléphone</Text><Text style={styles.contactValue}>+243 ...</Text></View>
            <View style={styles.contactRow}><Text style={styles.contactLabel}>Email</Text><Text style={styles.contactValue}>rh@dgrad.cd</Text></View>
            <View style={styles.contactRow}><Text style={styles.contactLabel}>Site</Text><Text style={styles.contactValue}>www.dgrad.cd</Text></View>
          </View>

          <View style={styles.versoRight}>
            <View style={styles.qrBoxBig}>
              {qrDataUrl ? <Image src={qrDataUrl} style={styles.qr} /> : <Text style={styles.qrPlaceholder}>QR</Text>}
            </View>
            <View style={styles.barcode}>
              {bars.map((w, i) => <View key={i} style={[styles.bar, { width: w }]} />)}
            </View>
            <Text style={styles.contactValue}>N° {numero}</Text>
            <View style={styles.signLine}><Text style={styles.signText}>Le Directeur des RH</Text></View>
          </View>
        </View>
      </View>
    </View>
  );
};

const CarteAgentPDF: React.FC<CarteAgentCardProps> = (props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.faceLabel}>RECTO</Text>
      <Recto {...props} />
      <View style={styles.spacer} />
      <Text style={styles.faceLabel}>VERSO</Text>
      <Verso {...props} />
    </Page>
  </Document>
);

export default CarteAgentPDF;
