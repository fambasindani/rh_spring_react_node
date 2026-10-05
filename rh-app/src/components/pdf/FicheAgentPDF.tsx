import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { AgentDetailsResponse } from '../../types/agent';
import { format } from 'date-fns';
import logo from '../../assets/logo.png';
import { BACKEND_BASE_URL } from '../../config/constants';

const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 8,
    marginBottom: 15,
  },

  logo: {
    width: 60,
    height: 60,
  },

  headerCenter: {
    flex: 1,
    textAlign: 'center',
  },

  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  subTitle: {
    fontSize: 9,
    marginTop: 2,
  },

  ficheTitle: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: 'bold',
  },

  personalInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
  },

  infoTextContainer: {
    flex: 1,
    marginRight: 10,
  },

  headerPhoto: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#000',
    padding: 2,
  },

  section: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 3,
  },

  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },

  label: {
    width: 110,
    fontWeight: 'bold',
    color: '#333',
  },

  value: {
    flex: 1,
  },

  dependantBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 5,
    marginBottom: 5,
  },

  etudeBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 5,
    marginBottom: 5,
  },

  promotionBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 5,
    marginBottom: 5,
  },

  affectationBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 5,
    marginBottom: 5,
  },

  gridTwoColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  gridItem: {
    width: '48%',
  },

  footer: {
    position: 'absolute',
    bottom: 15,
    left: 25,
    right: 25,
    textAlign: 'center',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 5,
  },
});

interface Props {
  agent: AgentDetailsResponse;
  photoBase64?: string;
}

const FicheAgentPDF: React.FC<Props> = ({ agent, photoBase64 }) => {
  const getPhotoSrc = () => {
    if (photoBase64) return photoBase64;
    if (!agent.photo) return undefined;
    if (agent.photo.startsWith('http')) return agent.photo;
    return `${BACKEND_BASE_URL}${agent.photo}`;
  };

  const photoSrc = getPhotoSrc();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={logo} style={styles.logo} />
          <View style={styles.headerCenter}>
            <Text style={styles.title}>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</Text>
            <Text style={styles.subTitle}>
              DIRECTION GÉNÉRALE DES RECETTES ADMINISTRATIVES
            </Text>
            <Text style={styles.ficheTitle}>
              FICHE D'IDENTIFICATION DE L'AGENT
            </Text>
          </View>
        </View>

        <View style={styles.personalInfoContainer}>
          <View style={styles.infoTextContainer}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Matricule</Text>
              <Text style={styles.value}>{agent.matricule}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Nom complet</Text>
              <Text style={styles.value}>{agent.nom} {agent.postnom} {agent.prenom}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Sexe</Text>
              <Text style={styles.value}>{agent.sexe === 'M' ? 'Masculin' : 'Féminin'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date de naissance</Text>
              <Text style={styles.value}>{format(new Date(agent.dateNaissance), 'dd/MM/yyyy')}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Téléphone</Text>
              <Text style={styles.value}>{agent.telephone}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{agent.email}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>État civil</Text>
              <Text style={styles.value}>{agent.etatCivil}</Text>
            </View>
          </View>

          {photoSrc ? (
            <Image src={photoSrc} style={styles.headerPhoto} />
          ) : (
            <View style={[styles.headerPhoto, { justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ fontSize: 8 }}>Pas de photo</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Carrière</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Grade</Text>
            <Text style={styles.value}>{agent.gradeSigle} - {agent.gradeNom}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fonction</Text>
            <Text style={styles.value}>{agent.fonctionNom}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Direction</Text>
            <Text style={styles.value}>{agent.directionSigle} - {agent.directionNom}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date engagement</Text>
            <Text style={styles.value}>{format(new Date(agent.dateEngagement), 'dd/MM/yyyy')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Référence</Text>
            <Text style={styles.value}>{agent.referenceEngagement}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Origine</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Village</Text>
            <Text style={styles.value}>{agent.village}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Territoire</Text>
            <Text style={styles.value}>{agent.territoire}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Province</Text>
            <Text style={styles.value}>{agent.province}</Text>
          </View>
        </View>

        {agent.affiliations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Affiliations familiales</Text>
            {agent.affiliations.map((d, i) => (
              <View key={i} style={styles.dependantBox}>
                <Text style={{ fontWeight: 'bold' }}>
                  {d.nom} {d.postnom} {d.prenom} ({d.relation})
                </Text>
                <Text>Né(e) le {format(new Date(d.dateNaissance), 'dd/MM/yyyy')} à {d.lieuNaissance}</Text>
                <Text>Statut : {d.statut ? 'Actif' : 'Inactif'}</Text>
              </View>
            ))}
          </View>
        )}

        {agent.etudes && agent.etudes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Études</Text>
            <View style={styles.gridTwoColumns}>
              {agent.etudes.map((e, i) => (
                <View key={i} style={[styles.etudeBox, styles.gridItem]}>
                  <Text style={{ fontWeight: 'bold' }}>{e.etablissement}</Text>
                  <Text>{e.nombreAnnee} an(s)</Text>
                  <Text>{e.lieu}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {agent.promotions && agent.promotions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Promotions</Text>
            {agent.promotions.map((p, i) => (
              <View key={i} style={styles.promotionBox}>
                <Text style={{ fontWeight: 'bold' }}>
                  Grade : {p.gradeSigle} - {p.gradeNom}
                </Text>
                <Text>Date début : {format(new Date(p.dateDebut), 'dd/MM/yyyy')}</Text>
                {p.dateFin && (
                  <Text>Date fin : {format(new Date(p.dateFin), 'dd/MM/yyyy')}</Text>
                )}
                <Text>Référence : {p.reference}</Text>
              </View>
            ))}
          </View>
        )}

        {agent.affectations && agent.affectations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Affectations</Text>
            {agent.affectations.map((a, i) => (
              <View key={i} style={styles.affectationBox}>
                <Text style={{ fontWeight: 'bold' }}>
                  Direction : {a.directionSigle} - {a.directionNom}
                </Text>
                <Text>Date début : {format(new Date(a.dateDebut), 'dd/MM/yyyy')}</Text>
                {a.dateFin && (
                  <Text>Date fin : {format(new Date(a.dateFin), 'dd/MM/yyyy')}</Text>
                )}
                {!a.dateFin && <Text>Affectation actuelle</Text>}
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          Document généré le {format(new Date(), 'dd/MM/yyyy')} - DGRAD
        </Text>
      </Page>
    </Document>
  );
};

export default FicheAgentPDF;