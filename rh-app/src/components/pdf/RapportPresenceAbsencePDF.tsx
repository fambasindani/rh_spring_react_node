import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logo from '../../assets/logo.png';

export interface RapportPresenceRow {
  id: number;
  agentNom?: string;
  agentPrenom?: string;
  directionNom: string;
  datePresence: string;
  heureArrivee?: string | null;
  heureDepart?: string | null;
  statut: string;
  observation?: string;
}

export interface RapportAbsenceRow {
  id: number;
  agentNom?: string;
  agentPrenom?: string;
  directionNom: string;
  dateDebut: string;
  dateFin: string;
  motif?: string;
  statut: boolean;
}

interface Props {
  debut: string;
  fin: string;
  directionLabel: string;
  stats: {
    presents: number;
    retards: number;
    absentsJour: number;
    absences: number;
    agents: number;
    taux: number;
  };
  presences: RapportPresenceRow[];
  absences: RapportAbsenceRow[];
}

const styles = StyleSheet.create({
  page: { padding: 25, fontFamily: 'Helvetica', fontSize: 9 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 8,
    marginBottom: 12,
  },
  logo: { width: 58, height: 58 },
  headerCenter: { flex: 1, textAlign: 'center', paddingHorizontal: 8 },
  title: { fontSize: 13, fontWeight: 'bold' },
  subTitle: { fontSize: 8.5, marginTop: 2 },
  ficheTitle: { marginTop: 4, fontSize: 11, fontWeight: 'bold' },

  metaBox: { borderWidth: 1, borderColor: '#cbd5e1', padding: 6, marginBottom: 10, borderRadius: 3 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 9 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statBox: { width: '16%', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, padding: 6, textAlign: 'center' },
  statLabel: { fontSize: 7, color: '#64748b', textTransform: 'uppercase' },
  statValue: { fontSize: 15, fontWeight: 'bold', marginTop: 2 },

  sectionTitle: { fontSize: 11, fontWeight: 'bold', marginTop: 6, marginBottom: 5 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 3 },
  tableRow: { flexDirection: 'row', borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#e2e8f0', paddingVertical: 3 },
  th: { fontSize: 7.5, fontWeight: 'bold', paddingHorizontal: 3 },
  td: { fontSize: 7.5, paddingHorizontal: 3 },
  empty: { fontSize: 8, color: '#94a3b8', fontStyle: 'italic', paddingVertical: 4 },
  footer: {
    position: 'absolute', bottom: 12, left: 25, right: 25, textAlign: 'center',
    fontSize: 7, color: '#94a3b8', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 3,
  },
});

// Largeurs de colonnes (présences)
const PW = { agent: '26%', dir: '24%', date: '12%', arr: '10%', dep: '10%', statut: '18%' };
// Absences
const AW = { agent: '26%', dir: '24%', du: '13%', au: '13%', motif: '24%' };

const hhmm = (h?: string | null) => (h ? String(h).slice(0, 5) : '-');

const RapportPresenceAbsencePDF: React.FC<Props> = ({ debut, fin, directionLabel, stats, presences, absences }) => {
  const genDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* En-tête avec logo DGRAD */}
        <View style={styles.header} fixed>
          <Image src={logo} style={styles.logo} />
          <View style={styles.headerCenter}>
            <Text style={styles.title}>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</Text>
            <Text style={styles.subTitle}>
              DIRECTION GÉNÉRALE DES RECETTES ADMINISTRATIVES, JUDICIAIRES, DOMANIALES ET DE PARTICIPATIONS
            </Text>
            <Text style={styles.ficheTitle}>RAPPORT DES PRÉSENCES ET ABSENCES</Text>
          </View>
        </View>

        {/* Méta */}
        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Période : du {debut} au {fin}</Text>
            <Text style={styles.metaText}>Direction : {directionLabel}</Text>
            <Text style={styles.metaText}>Généré le {genDate}</Text>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Présences</Text>
            <Text style={styles.statValue}>{stats.presents}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Retards</Text>
            <Text style={styles.statValue}>{stats.retards}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Abs. jours</Text>
            <Text style={styles.statValue}>{stats.absentsJour}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Abs. dossiers</Text>
            <Text style={styles.statValue}>{stats.absences}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Agents</Text>
            <Text style={styles.statValue}>{stats.agents}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Taux</Text>
            <Text style={styles.statValue}>{stats.taux}%</Text>
          </View>
        </View>

        {/* Tableau des présences */}
        <Text style={styles.sectionTitle}>Présences ({presences.length})</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { width: PW.agent }]}>Agent</Text>
          <Text style={[styles.th, { width: PW.dir }]}>Direction</Text>
          <Text style={[styles.th, { width: PW.date }]}>Date</Text>
          <Text style={[styles.th, { width: PW.arr }]}>Arrivée</Text>
          <Text style={[styles.th, { width: PW.dep }]}>Départ</Text>
          <Text style={[styles.th, { width: PW.statut }]}>Statut</Text>
        </View>
        {presences.length === 0 ? (
          <Text style={styles.empty}>Aucune présence sur la période.</Text>
        ) : (
          presences.map((p) => (
            <View key={`p-${p.id}`} style={styles.tableRow} wrap={false}>
              <Text style={[styles.td, { width: PW.agent }]}>{p.agentNom} {p.agentPrenom}</Text>
              <Text style={[styles.td, { width: PW.dir }]}>{p.directionNom}</Text>
              <Text style={[styles.td, { width: PW.date }]}>{p.datePresence}</Text>
              <Text style={[styles.td, { width: PW.arr }]}>{hhmm(p.heureArrivee)}</Text>
              <Text style={[styles.td, { width: PW.dep }]}>{hhmm(p.heureDepart)}</Text>
              <Text style={[styles.td, { width: PW.statut }]}>{p.statut}</Text>
            </View>
          ))
        )}

        {/* Tableau des absences */}
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Absences ({absences.length})</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { width: AW.agent }]}>Agent</Text>
          <Text style={[styles.th, { width: AW.dir }]}>Direction</Text>
          <Text style={[styles.th, { width: AW.du }]}>Du</Text>
          <Text style={[styles.th, { width: AW.au }]}>Au</Text>
          <Text style={[styles.th, { width: AW.motif }]}>Motif</Text>
        </View>
        {absences.length === 0 ? (
          <Text style={styles.empty}>Aucune absence sur la période.</Text>
        ) : (
          absences.map((a) => (
            <View key={`a-${a.id}`} style={styles.tableRow} wrap={false}>
              <Text style={[styles.td, { width: AW.agent }]}>{a.agentNom} {a.agentPrenom}</Text>
              <Text style={[styles.td, { width: AW.dir }]}>{a.directionNom}</Text>
              <Text style={[styles.td, { width: AW.du }]}>{a.dateDebut}</Text>
              <Text style={[styles.td, { width: AW.au }]}>{a.dateFin}</Text>
              <Text style={[styles.td, { width: AW.motif }]}>{a.motif || '-'}</Text>
            </View>
          ))
        )}

        <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `DGRAD — Rapport présences & absences — Page ${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  );
};

export default RapportPresenceAbsencePDF;
