# Senior Brick — Booking Domain & Service

Brique fonctionnelle isolée démontrant une architecture senior :

- **Typage strict** TypeScript (`strict: true`)
- **Modèles de données étanches** (Value Objects, types nominaux, Result type)
- **Logique métier pure** testée à 100 % de succès
- **Composant React + Tailwind** consommateur du domaine

## Structure

```
src/
  domain.ts          # Value Objects (Email, TimeSlot) + Entity + Result
  booking-service.ts # Service avec invariants métier
  components/
    BookingForm.tsx  # Composant UI strictement typé
tests/
  booking-service.test.ts
```

## Lancer les tests

```bash
npm test
```

Résultat attendu : **14 tests passed** (100 % de succès).

## Principes appliqués

1. **Aucun primitif n'entre dans le domaine sans validation** (Email.create, TimeSlot.create).
2. **Invariants protégés** : durée min/max, non-chevauchement, transitions d'état.
3. **Result type** au lieu d'exceptions pour le flow métier (meilleure composabilité).
4. **Isolation** : le composant React ne connaît que les types exportés.

## Évolution possible

- Persistance PostgreSQL via un Repository
- API FastAPI / Express exposant les mêmes contrats
- Branded types encore plus stricts (`Brand<string, "UserId">`)
