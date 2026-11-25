# Pull Request : Brique BookingService — Architecture & Typage Senior

## Contexte

Objectif : remplacer le code jetable des « vibe coders » par une brique fonctionnelle isolée, strictement typée, avec modèles de données étanches et couverture de tests à 100 % de succès.

Cette PR introduit le domaine de réservation (Booking) comme exemple de référence.

## Choix techniques

- **Value Objects** (`Email`, `TimeSlot`) : encapsulent validation et invariants. Impossible de créer un Email ou un créneau invalide.
- **Types nominaux** (`BookingId`, `UserId`) : empêchent les confusions de strings.
- **Result<T>** : pattern success/failure explicite, sans exceptions pour le contrôle de flux métier.
- **Service pur** : `BookingService` contient toute la logique (création, confirmation, annulation, détection de conflits). Aucune dépendance externe.
- **Composant React** : `BookingForm` consomme uniquement les types du domaine et applique Tailwind pour l'UI.
- **Tests** : Jest + ts-jest. 14 tests couvrant :
  - Chemins heureux
  - Validations (email, durée, ordre des dates)
  - Règles métier (chevauchement, transitions d'état)
  - Cas d'erreur (entité inexistante, déjà traitée)

## Preuves d'exécution

```bash
$ npm test

PASS tests/booking-service.test.ts
  BookingService - Couverture complète de la logique métier
    createBooking
      ✓ crée une réservation valide
      ✓ rejette un email invalide
      ✓ rejette un créneau trop court
      ✓ rejette un créneau avec fin avant début
      ✓ rejette un chevauchement pour le même utilisateur
      ✓ autorise un créneau pour un autre utilisateur
    confirmBooking & cancelBooking
      ✓ confirme une réservation pending
      ✓ refuse de confirmer une réservation déjà confirmée
      ✓ annule une réservation
      ✓ refuse d'annuler une réservation déjà annulée
      ✓ refuse d'opérer sur une réservation inexistante
    Value Objects
      ✓ Email.create rejette les emails mal formés
      ✓ Email.create accepte et normalise
      ✓ TimeSlot détecte les chevauchements

Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
```

**100 % de succès. Aucun commit tant que la suite n'est pas verte.**

## Prochaines étapes (hors scope de cette PR)

- Repository PostgreSQL
- Endpoint FastAPI / Express exposant les mêmes contrats
- Branded types encore plus stricts + runtime checks

## Checklist senior

- [x] Typage strict activé
- [x] Modèles étanches (pas de primitives brutes)
- [x] Logique isolée et pure
- [x] Tests unitaires complets (14/14 passed)
- [x] Documentation de la PR
- [x] Composant UI typé + Tailwind
