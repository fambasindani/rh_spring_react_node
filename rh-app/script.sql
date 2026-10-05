-- 1. Trouver le nom de la contrainte
DECLARE @constraintName NVARCHAR(128)
SELECT @constraintName = name 
FROM sys.check_constraints 
WHERE parent_object_id = OBJECT_ID('utilisateurs') 
AND definition LIKE '%role%'

-- 2. La supprimer
IF @constraintName IS NOT NULL
    EXEC('ALTER TABLE utilisateurs DROP CONSTRAINT ' + @constraintName)

-- 3. Recréer avec tous les rôles
ALTER TABLE utilisateurs ADD CONSTRAINT CK_utilisateurs_role 
CHECK (role IN ('ADMIN', 'UTILISATEUR', 'DIRECTEUR', 'AGENT', 'RH'))