import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logo from '../../assets/logo.png';
import type { Agent } from '../../types/agent';

interface Props {
  title: string;
  agents: Agent[];
}

const styles = StyleSheet.create({
  page: { padding: 25, fontFamily: 'Helvetica', fontSize: 9 },
  header: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#000', paddingBottom: 8, marginBottom: 12 },
  logo: { width: 58, height: 58 },
  headerCenter: { flex: 1, textAlign: 'center', paddingHorizontal: 8 },
  title: { fontSize: 13, fontWeight: 'bold' },
  subTitle: { fontSize: 8.5, marginTop: 2 },
  ficheTitle: { marginTop: 4, fontSize: 11, fontWeight: 'bold' },
  metaBox: { borderWidth: 1, borderColor: '#cbd5e1', padding: 6, marginBottom: 10, borderRadius: 3 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 9 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 3 },
  tableRow: { flexDirection: 'row', borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#e2e8f0', paddingVertical: 3 },
  th: { fontSize: 7.5, fontWeight: 'bold', paddingHorizontal: 3 },
  td: { fontSize: 7.5, paddingHorizontal: 3 },
  empty: { fontSize: 8, color: '#94a3b8', fontStyle: 'italic', paddingVertical: 4 },
  footer: { position: 'absolute', bottom: 12, left: 25, right: 25, textAlign: 'center', fontSize: 7, color: '#94a3b8', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 3 },
});

const W = { mat: '12%', agent: '28%', grade: '12%', fonction: '18%', direction: '20%', statut: '10%' };

const RapportAgentsListePDF: React.FC<Props> = ({ title, agents }) => {
  const genDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <Image src={logo} style={styles.logo} />
          <View style={styles.headerCenter}>
            <Text style={styles.title}>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</Text>
            <Text style={styles.subTitle}>DIRECTION GÉNÉRALE DES RECETTES ADMINISTRATIVES, JUDICIAIRES, DOMANIALES ET DE PARTICIPATIONS</Text>
            <Text style={styles.ficheTitle}>{title.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Liste : {title}</Text>
            <Text style={styles.metaText}>Nombre : {agents.length}</Text>
            <Text style={styles.metaText}>Généré le {genDate}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.th, { width: W.mat }]}>Matricule</Text>
          <Text style={[styles.th, { width: W.agent }]}>Agent</Text>
          <Text style={[styles.th, { width: W.grade }]}>Grade</Text>
          <Text style={[styles.th, { width: W.fonction }]}>Fonction</Text>
          <Text style={[styles.th, { width: W.direction }]}>Direction</Text>
          <Text style={[styles.th, { width: W.statut }]}>Statut</Text>
        </View>
        {agents.length === 0 ? (
          <Text style={styles.empty}>Aucun agent.</Text>
        ) : (
          agents.map((a) => (
            <View key={a.id} style={styles.tableRow} wrap={false}>
              <Text style={[styles.td, { width: W.mat }]}>{a.matricule || '-'}</Text>
              <Text style={[styles.td, { width: W.agent }]}>{a.nom} {a.postnom} {a.prenom}</Text>
              <Text style={[styles.td, { width: W.grade }]}>{a.grade?.sigle || '-'}</Text>
              <Text style={[styles.td, { width: W.fonction }]}>{a.fonction?.nom || '-'}</Text>
              <Text style={[styles.td, { width: W.direction }]}>{a.direction?.nom || '-'}</Text>
              <Text style={[styles.td, { width: W.statut }]}>{a.statut ? 'Actif' : 'Inactif'}</Text>
            </View>
          ))
        )}

        <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `DGRAD — Liste des agents — Page ${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  );
};

export default RapportAgentsListePDF;
