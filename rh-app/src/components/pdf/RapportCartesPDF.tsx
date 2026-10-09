import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logo from '../../assets/logo.png';
import type { Carte, CarteStatut } from '../../services/cartes.service';

interface Props {
  statutLabel: string;
  cartes: Carte[];
  stats?: Record<string, number>;
}

const styles = StyleSheet.create({
  page: { padding: 25, fontFamily: 'Helvetica', fontSize: 9 },
  header: {
    flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#000',
    paddingBottom: 8, marginBottom: 12,
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
  statBox: { width: '24%', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, padding: 6, textAlign: 'center' },
  statLabel: { fontSize: 7, color: '#64748b', textTransform: 'uppercase' },
  statValue: { fontSize: 15, fontWeight: 'bold', marginTop: 2 },
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

const W = { agent: '26%', dir: '20%', num: '16%', demande: '13%', validation: '13%', statut: '12%' };

const RapportCartesPDF: React.FC<Props> = ({ statutLabel, cartes, stats }) => {
  const genDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const fmt = (d?: string) => (d ? d : '-');

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <Image src={logo} style={styles.logo} />
          <View style={styles.headerCenter}>
            <Text style={styles.title}>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</Text>
            <Text style={styles.subTitle}>
              DIRECTION GÉNÉRALE DES RECETTES ADMINISTRATIVES, JUDICIAIRES, DOMANIALES ET DE PARTICIPATIONS
            </Text>
            <Text style={styles.ficheTitle}>RAPPORT DES CARTES — {statutLabel.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Liste : {statutLabel}</Text>
            <Text style={styles.metaText}>Nombre : {cartes.length}</Text>
            <Text style={styles.metaText}>Généré le {genDate}</Text>
          </View>
        </View>

        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}><Text style={styles.statLabel}>Demandeurs</Text><Text style={styles.statValue}>{stats.demandes ?? 0}</Text></View>
            <View style={styles.statBox}><Text style={styles.statLabel}>À valider</Text><Text style={styles.statValue}>{stats.recues ?? 0}</Text></View>
            <View style={styles.statBox}><Text style={styles.statLabel}>Détenteurs</Text><Text style={styles.statValue}>{stats.validees ?? 0}</Text></View>
            <View style={styles.statBox}><Text style={styles.statLabel}>Perdues</Text><Text style={styles.statValue}>{stats.perdues ?? 0}</Text></View>
          </View>
        )}

        <View style={styles.tableHeader}>
          <Text style={[styles.th, { width: W.agent }]}>Agent</Text>
          <Text style={[styles.th, { width: W.dir }]}>Direction</Text>
          <Text style={[styles.th, { width: W.num }]}>N° carte</Text>
          <Text style={[styles.th, { width: W.demande }]}>Demande</Text>
          <Text style={[styles.th, { width: W.validation }]}>Validation</Text>
          <Text style={[styles.th, { width: W.statut }]}>Statut</Text>
        </View>
        {cartes.length === 0 ? (
          <Text style={styles.empty}>Aucune carte.</Text>
        ) : (
          cartes.map((c) => (
            <View key={c.id} style={styles.tableRow} wrap={false}>
              <Text style={[styles.td, { width: W.agent }]}>{c.agentNom} {c.agentPostnom} {c.agentPrenom}</Text>
              <Text style={[styles.td, { width: W.dir }]}>{c.directionNom || '-'}</Text>
              <Text style={[styles.td, { width: W.num }]}>{c.numeroCarte || '-'}</Text>
              <Text style={[styles.td, { width: W.demande }]}>{fmt(c.dateDemande)}</Text>
              <Text style={[styles.td, { width: W.validation }]}>{fmt(c.dateValidation)}</Text>
              <Text style={[styles.td, { width: W.statut }]}>{c.statut}</Text>
            </View>
          ))
        )}

        <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `DGRAD — Gestion des cartes — Page ${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  );
};

export default RapportCartesPDF;
