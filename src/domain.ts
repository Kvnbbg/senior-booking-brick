/**
 * Domain Models - Étanchéité maximale via types nominaux et Value Objects.
 * Aucun primitif n'échappe au domaine sans validation.
 */

// Type nominal pour les IDs (évite les confusions string)
type Brand<K, T> = K & { readonly __brand: T };

export type BookingId = Brand<string, "BookingId">;
export type UserId = Brand<string, "UserId">;

// Value Object : Email validé
export class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(raw.trim().toLowerCase())) {
      return null;
    }
    return new Email(raw.trim().toLowerCase());
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

// Value Object : Créneau horaire (TimeSlot) avec invariants
export class TimeSlot {
  private constructor(
    public readonly start: Date,
    public readonly end: Date
  ) {}

  static create(start: Date, end: Date): TimeSlot | null {
    if (!(start instanceof Date) || !(end instanceof Date)) return null;
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    if (end <= start) return null;
    // Durée minimale 15 min, maximale 8h
    const durationMs = end.getTime() - start.getTime();
    if (durationMs < 15 * 60 * 1000 || durationMs > 8 * 60 * 60 * 1000) {
      return null;
    }
    return new TimeSlot(start, end);
  }

  get durationMinutes(): number {
    return (this.end.getTime() - this.start.getTime()) / (60 * 1000);
  }

  overlaps(other: TimeSlot): boolean {
    return this.start < other.end && this.end > other.start;
  }
}

// Entity : Booking avec état contrôlé
export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface Booking {
  readonly id: BookingId;
  readonly userId: UserId;
  readonly email: Email;
  readonly slot: TimeSlot;
  readonly status: BookingStatus;
  readonly createdAt: Date;
}

// Result type pour les opérations (pas d'exceptions pour le flow métier)
export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
