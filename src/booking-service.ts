/**
 * BookingService - Logique métier isolée, pure et testable.
 * Toutes les règles d'invariants sont appliquées ici.
 */
import {
  Booking,
  BookingId,
  UserId,
  Email,
  TimeSlot,
  BookingStatus,
  Result,
  ok,
  err,
} from "./domain";

export class BookingService {
  private bookings: Booking[] = [];
  private nextId = 1;

  /**
   * Crée une réservation après validation complète des données.
   * Règles :
   * - Email valide
   * - Créneau valide (durée, dates)
   * - Pas de chevauchement pour le même utilisateur
   */
  createBooking(
    userIdRaw: string,
    emailRaw: string,
    start: Date,
    end: Date
  ): Result<Booking> {
    const email = Email.create(emailRaw);
    if (!email) {
      return err("Email invalide");
    }

    const slot = TimeSlot.create(start, end);
    if (!slot) {
      return err("Créneau horaire invalide (durée ou dates)");
    }

    const userId = userIdRaw as UserId; // Dans un vrai système, validation plus poussée

    // Vérification de non-chevauchement pour cet utilisateur
    const conflict = this.bookings.find(
      (b) =>
        b.userId === userId &&
        b.status !== "cancelled" &&
        b.slot.overlaps(slot)
    );

    if (conflict) {
      return err("Créneau en conflit avec une réservation existante");
    }

    const booking: Booking = {
      id: `bk_${this.nextId++}` as BookingId,
      userId,
      email,
      slot,
      status: "pending",
      createdAt: new Date(),
    };

    this.bookings.push(booking);
    return ok(booking);
  }

  /**
   * Confirme une réservation (seulement si pending).
   */
  confirmBooking(id: BookingId): Result<Booking> {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) {
      return err("Réservation introuvable");
    }
    if (booking.status !== "pending") {
      return err(`Impossible de confirmer une réservation au statut ${booking.status}`);
    }

    const confirmed: Booking = { ...booking, status: "confirmed" };
    const index = this.bookings.findIndex((b) => b.id === id);
    this.bookings[index] = confirmed;
    return ok(confirmed);
  }

  /**
   * Annule une réservation (si non déjà annulée).
   */
  cancelBooking(id: BookingId): Result<Booking> {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) {
      return err("Réservation introuvable");
    }
    if (booking.status === "cancelled") {
      return err("Réservation déjà annulée");
    }

    const cancelled: Booking = { ...booking, status: "cancelled" };
    const index = this.bookings.findIndex((b) => b.id === id);
    this.bookings[index] = cancelled;
    return ok(cancelled);
  }

  getBooking(id: BookingId): Booking | null {
    return this.bookings.find((b) => b.id === id) ?? null;
  }

  getUserBookings(userId: UserId): Booking[] {
    return this.bookings.filter((b) => b.userId === userId);
  }

  // Pour les tests : reset
  clear(): void {
    this.bookings = [];
    this.nextId = 1;
  }
}
