package grad.microservice_auth.Enum;

/**
 * Cycle de vie d'une carte :
 * DEMANDE  -> demande enregistree (en attente de la carte aupres de l'entreprise)
 * RECUE    -> carte recue, accuse de reception depose (en attente de validation RH)
 * VALIDEE  -> accuse valide par les RH : l'agent detient sa carte
 * PERDUE   -> carte perdue (signalee par l'agent)
 */
public enum CarteStatut {
    DEMANDE,
    RECUE,
    VALIDEE,
    PERDUE
}
