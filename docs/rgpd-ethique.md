# Moodly : RGPD, anonymisation et éthique

Cette note explique quelles données Moodly traite, comment l'anonymat des réponses est garanti, combien de temps les données sont conservées, quels risques éthiques nous avons identifiés et comment nous y répondons. Elle se termine par les limites connues de cette première version.

---

## 1. Données traitées et finalité

**Finalité.** Donner aux managers une vision **collective** et **anonyme** du moral de leur équipe, pour repérer une tendance (une période difficile, une cause récurrente) et en parler collectivement. Moodly n'est **pas** un outil d'évaluation individuelle.

| Donnée | Table | Donnée personnelle ? | Pourquoi elle est nécessaire |
|---|---|---|---|
| Email, prénom, nom, mot de passe (haché), rôle, équipe | `User` | oui | se connecter, savoir à quelle équipe rattacher une réponse et quel écran afficher |
| Personne + jour de réponse | `CheckIn` | oui | empêcher deux réponses le même jour, et rien d'autre ; effacé dès le lendemain |
| Note de 1 à 5, 0 à 3 thèmes (parmi 10), jour, équipe | `Mood` | **non**, par conception (voir section 2) | calculer les moyennes et les thèmes de l'équipe |
| Message du manager à son équipe (280 caractères), date de mise à jour | `TeamMessage` | non sur les salariés : il est écrit par le manager, sous son rôle | informer l'équipe des suites données aux résultats |

**Minimisation.** Nous avons volontairement écarté :

- le **commentaire libre**, car un texte peut identifier son auteur par son style ou son contenu, et contenir des données sensibles ;
- l'**heure** de réponse, car un horodatage précis permettrait de rapprocher une humeur d'une connexion ;
- l'**historique personnel**, qui obligerait à relier les humeurs aux personnes ;
- toute donnée de **santé**, avec un thème « santé » délibérément absent (voir section 4) ;
- les **notifications** et relances, pour que la participation reste spontanée.

**Base légale envisagée.** Dans une relation de travail, le consentement du salarié est difficilement considéré comme libre. La base la plus adaptée serait l'**intérêt légitime** de l'employeur (prévention des risques psychosociaux, démarche RSE), avec une **participation facultative** et une information claire des salariés. Ce choix, comme une éventuelle analyse d'impact (AIPD) et l'information du CSE, serait à valider avec le délégué à la protection des données (DPO) avant un déploiement réel.

## 2. Anonymisation par conception

L'anonymat ne repose pas sur l'interface : il est inscrit dans la structure même des données. Voici les 9 règles appliquées, expliquées simplement.

| # | Règle | Ce que ça empêche |
|---|---|---|
| 1 | Une humeur (`Mood`) ne contient **aucun identifiant de personne**. | Lire directement « qui a répondu quoi » dans la base. |
| 2 | `Mood` et `CheckIn` ne stockent que le **jour**, jamais l'heure. | Rapprocher une humeur d'un `CheckIn` ou d'une connexion grâce à l'heure. |
| 3 | Les identifiants sont des **UUID aléatoires**, jamais des numéros qui se suivent. | Deviner l'ordre des réponses à partir des identifiants. |
| 4 | L'**équipe et le jour** sont fixés **par le serveur**, à partir du jeton de connexion ; une requête qui tente de les envoyer est refusée. | Tricher sur la date, ou noyer une réponse dans une autre équipe. |
| 5 | Le manager ne reçoit **que des agrégats** calculés côté serveur, et uniquement pour **sa propre équipe**. | Accéder à des réponses individuelles, ou aux résultats d'une autre équipe. |
| 6 | Un jour avec **moins de 3 réponses est masqué** : ni moyenne, ni nombre de réponses. | Déduire la réponse d'une personne quand elle est seule ou presque à avoir répondu. |
| 7 | Le contenu des réponses n'est **jamais écrit dans les journaux** (logs) du serveur. | Retrouver les réponses dans des fichiers techniques. |
| 8 | L'envoi d'une humeur renvoie seulement `{ "submitted": true }`. | Récupérer un identifiant qui permettrait de retrouver la réponse plus tard. |
| 9 | La suppression d'un compte efface la personne et ses `CheckIn`, mais **garde les humeurs** : elles sont anonymes et ne sont donc pas des données personnelles. | Fausser les moyennes passées de l'équipe, sans rien conserver d'identifiant. |

Ces règles sont vérifiées par des tests automatiques. L'un d'eux contrôle **directement en base** qu'une humeur enregistrée ne contient ni l'identifiant, ni l'email, ni le nom de la personne.

## 3. Le seuil d'anonymat

Avec une ou deux réponses dans la journée, un manager pourrait deviner qui a répondu : « seule Alice était là lundi ». Moodly applique donc un **seuil de 3 réponses** :

- un jour sous le seuil est **masqué** dans le graphe : la courbe y fait un trou, et la moyenne comme le nombre de réponses ne sont pas transmis ;
- si le **total** de réponses de la période est sous le seuil, la moyenne globale et les classements de thèmes ne sont pas affichés ;
- la **moyenne globale exclut les jours masqués**. Sans cette précaution, on pourrait retrouver la moyenne d'un jour masqué par soustraction, à partir de la moyenne globale et des jours visibles. La moyenne de la **période précédente**, utilisée pour afficher l'évolution, suit la même règle ;
- la **météo de l'équipe**, visible par les employés, ne donne qu'une **catégorie** parmi 4 (☀️ ⛅ ☁️ 🌧️), jamais un chiffre. Elle porte sur les **jours visibles** des 7 jours précédents et **exclut le jour même** : un salarié ne peut pas comparer la météo avant et après sa propre réponse, ni en déduire celle d'un collègue ;
- les **points « À surveiller »** sont calculés à partir de ces agrégats. Celui qui signale un thème récurrent dans les réponses basses exige en plus **au moins 3 réponses basses** sur la période, pour ne jamais décrire une ou deux personnes ;
- le seuil est **réglable** (variable `MIN_RESPONSES_PER_DAY`), et l'API **refuse de démarrer** avec une valeur invalide ou inférieure à 2, pour éviter qu'une erreur de configuration désactive le masquage sans que personne ne s'en aperçoive.

Le manager est informé de ce masquage par une mention sous le graphe.

## 4. Des données de bien-être, potentiellement sensibles

Des informations sur l'humeur ou le moral peuvent toucher à l'état de santé, qui fait partie des **catégories particulières de données** de l'article 9 du RGPD, dont le traitement est en principe interdit sauf exceptions. Pour rester en dehors de ce champ :

- **aucun thème « santé »** n'est proposé (ni stress, ni fatigue, ni sommeil) ; les 10 thèmes portent sur le contexte de travail : charge de travail, ambiance d'équipe, management, équilibre vie pro / perso, reconnaissance, conditions de travail, organisation du travail, communication, autonomie, sens du travail. Un thème « santé » envoyé à l'API est refusé, et un test automatique le vérifie ;
- **aucun texte libre**, où une personne pourrait mentionner une maladie ou un traitement ;
- les humeurs sont **anonymes** et ne sont exploitées qu'en **moyennes d'équipe**.

## 5. Conservation et suppression

**Ce qui existe dans cette version :**

- la **suppression de compte**, depuis la page « Vos données » de l'application (avec une confirmation) ou par l'API (`DELETE /api/users/me`), efface la personne et ses `CheckIn` ; ses humeurs, anonymes, restent dans les moyennes ;
- la page **« Vos données »** informe chaque utilisateur, dans l'application, de ce qui est enregistré, de ce que voit le manager et de ce qu'il ne voit jamais ;
- après une suppression, le jeton de connexion de la personne est **refusé partout**, même s'il n'a pas encore expiré ;
- les `CheckIn` des jours passés sont **supprimés automatiquement** : au démarrage de l'API, à chaque nouvelle réponse et toutes les heures.

**Durées de conservation :**

| Donnée | Durée | Statut | Justification |
|---|---|---|---|
| `CheckIn` | **jusqu'à la fin de la journée** | appliqué | ils ne servent qu'à bloquer une deuxième réponse le jour même ; les supprimer renforce aussi l'anonymat (voir section 7) |
| Humeurs (`Mood`) | **12 mois glissants** | proposé | suffisant pour observer des tendances et des effets saisonniers ; au-delà, l'intérêt est faible |
| Comptes (`User`) | **durée du contrat**, puis suppression | proposé | rattacher une personne à son équipe n'a plus de raison d'être après son départ |

Les droits des personnes (information, accès, rectification, effacement, opposition) s'exercent auprès de l'employeur. L'information et l'effacement sont déjà disponibles directement dans l'application.

## 6. Risques éthiques et garde-fous

| Risque | Garde-fous dans Moodly |
|---|---|
| **Pression managériale** : se sentir obligé de répondre, ou de « bien » répondre | participation facultative ; pas de relance ni de notification ; le manager ne voit pas qui a répondu ; aucun taux de participation par personne |
| **Surveillance perçue** : l'outil vu comme un moyen de contrôle | anonymat par conception, expliqué dans l'application (page « Vos données ») et dans le tutoriel ; aucune donnée individuelle n'est consultable |
| **Ré-identification** dans les petites équipes | seuil de 3 réponses ; jours masqués exclus de la moyenne ; pas de texte libre ; pas d'heure enregistrée ; le manager ne voit que les 3 thèmes les plus cités sur toute la période, jamais les thèmes d'un jour donné |
| **Un salarié en difficulté** qui répond « très mal » sans que rien ne se passe | après une humeur basse (1 ou 2), l'application affiche des ressources de soutien : en parler autour de soi, la médecine du travail, le 3114. Ce message reste sur l'écran du salarié : rien n'est enregistré ni signalé à qui que ce soit, pour ne pas trahir l'anonymat |
| **Biais de participation** : seuls certains profils répondent | le taux de participation est affiché à côté des résultats, pour en relativiser la portée ; le tutoriel invite à lire une participation faible comme un signal en soi |
| **Usage détourné** : évaluer des personnes, ou comparer des équipes pour sanctionner | un manager ne voit que sa propre équipe ; le tutoriel rappelle que l'outil sert à repérer une tendance et à ouvrir le dialogue, pas à évaluer |
| **Des réponses sans suite** : l'équipe répond, mais rien ne change, et la participation s'effondre | le manager peut publier un message à toute l'équipe, visible sur l'écran de saisie, pour dire ce qu'il a compris et ce qu'il fait. Ce message s'adresse à l'équipe entière : il n'a aucun lien avec une réponse ou une personne |
| **Réduire le bien-être à un chiffre** | les thèmes et les préoccupations orientent vers des causes concrètes et une discussion collective, plutôt que vers la seule note |

Nous sommes conscients qu'un outil, même anonyme, ne remplace ni le dialogue ni l'action sur les causes : Moodly est un **signal**, à utiliser comme point de départ d'une conversation.

## 7. Limites connues de cette version

Nous préférons les énoncer clairement.

- **Rapprochement possible le jour même, par un administrateur de la base.** PostgreSQL enregistre pour chaque ligne un identifiant interne de transaction (`xmin`), ainsi qu'un ordre physique de stockage. Comme un `CheckIn` et son `Mood` sont écrits dans la même transaction, une personne ayant un **accès direct à la base** pourrait les rapprocher. Le manager, qui passe par l'application, ne le peut pas. **Correctif appliqué :** les `CheckIn` des jours passés, qui n'ont plus aucune utilité, sont supprimés automatiquement ; une fois le `CheckIn` supprimé, il n'y a plus rien à rapprocher. Ce risque résiduel est donc limité à la journée en cours, et à un accès technique direct à la base.
- **HTTP en clair.** Pour la démonstration sur un réseau local, l'application communique avec l'API en HTTP. Un déploiement réel imposerait HTTPS, et la suppression du réglage `cleartext`.
- **Nombre de réponses des jours masqués.** Le taux de participation permet, par différence avec les jours visibles, d'estimer le **nombre** total de réponses des jours masqués (jamais leur contenu).
- **Seuil de 3.** Il protège contre les cas évidents, mais reste bas pour de très petites équipes ; il est réglable et devrait être adapté à la taille des équipes.
- **Dix thèmes au lieu de six.** Le groupe a élargi la liste pour mieux décrire les situations. Plus il y a de thèmes, plus un thème rare peut, en théorie, désigner quelqu'un dans une très petite équipe. Ce risque reste limité : le manager ne voit que les 3 thèmes les plus cités sur toute la période, jamais le détail par jour.
- **Pas de purge automatique des humeurs ni des comptes** selon les durées proposées en section 5 (seuls les `CheckIn` passés sont supprimés automatiquement).
- **Comptes de démonstration** avec un mot de passe commun, uniquement pour la démo.
- **Validation juridique** (base légale, AIPD, information du CSE) à mener avec un DPO avant tout déploiement réel.
