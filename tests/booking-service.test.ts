import { BookingService } from "../src/booking-service";
import { Email, TimeSlot } from "../src/domain";

describe("BookingService - Couverture complète de la logique métier", () => {
  let service: BookingService;

  beforeEach(() => {
    service = new BookingService();
  });

  const validStart = new Date("2026-12-01T10:00:00Z");
  const validEnd = new Date("2026-12-01T11:00:00Z");

  describe("createBooking", () => {
    it("crée une réservation valide", () => {
      const result = service.createBooking(
        "user_123",
        "test@example.com",
        validStart,
        validEnd
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.email.value).toBe("test@example.com");
        expect(result.value.status).toBe("pending");
        expect(result.value.slot.durationMinutes).toBe(60);
      }
    });

    it("rejette un email invalide", () => {
      const result = service.createBooking(
        "user_123",
        "not-an-email",
        validStart,
        validEnd
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("Email invalide");
      }
    });

    it("rejette un créneau trop court", () => {
      const shortEnd = new Date(validStart.getTime() + 10 * 60 * 1000);
      const result = service.createBooking(
        "user_123",
        "test@example.com",
        validStart,
        shortEnd
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("Créneau horaire invalide");
      }
    });

    it("rejette un créneau avec fin avant début", () => {
      const result = service.createBooking(
        "user_123",
        "test@example.com",
        validEnd,
        validStart
      );
      expect(result.ok).toBe(false);
    });

    it("rejette un chevauchement pour le même utilisateur", () => {
      service.createBooking("user_123", "a@example.com", validStart, validEnd);

      const overlapStart = new Date("2026-12-01T10:30:00Z");
      const overlapEnd = new Date("2026-12-01T11:30:00Z");

      const result = service.createBooking(
        "user_123",
        "b@example.com",
        overlapStart,
        overlapEnd
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("conflit");
      }
    });

    it("autorise un créneau pour un autre utilisateur", () => {
      service.createBooking("user_123", "a@example.com", validStart, validEnd);

      const result = service.createBooking(
        "user_456",
        "b@example.com",
        validStart,
        validEnd
      );

      expect(result.ok).toBe(true);
    });
  });

  describe("confirmBooking & cancelBooking", () => {
    it("confirme une réservation pending", () => {
      const created = service.createBooking(
        "user_123",
        "test@example.com",
        validStart,
        validEnd
      );
      expect(created.ok).toBe(true);
      if (!created.ok) return;

      const confirmed = service.confirmBooking(created.value.id);
      expect(confirmed.ok).toBe(true);
      if (confirmed.ok) {
        expect(confirmed.value.status).toBe("confirmed");
      }
    });

    it("refuse de confirmer une réservation déjà confirmée", () => {
      const created = service.createBooking(
        "user_123",
        "test@example.com",
        validStart,
        validEnd
      );
      if (!created.ok) return;
      service.confirmBooking(created.value.id);

      const again = service.confirmBooking(created.value.id);
      expect(again.ok).toBe(false);
    });

    it("annule une réservation", () => {
      const created = service.createBooking(
        "user_123",
        "test@example.com",
        validStart,
        validEnd
      );
      if (!created.ok) return;

      const cancelled = service.cancelBooking(created.value.id);
      expect(cancelled.ok).toBe(true);
      if (cancelled.ok) {
        expect(cancelled.value.status).toBe("cancelled");
      }
    });

    it("refuse d'annuler une réservation déjà annulée", () => {
      const created = service.createBooking(
        "user_123",
        "test@example.com",
        validStart,
        validEnd
      );
      if (!created.ok) return;
      service.cancelBooking(created.value.id);

      const again = service.cancelBooking(created.value.id);
      expect(again.ok).toBe(false);
    });

    it("refuse d'opérer sur une réservation inexistante", () => {
      const fakeId = "bk_999" as any;
      expect(service.confirmBooking(fakeId).ok).toBe(false);
      expect(service.cancelBooking(fakeId).ok).toBe(false);
    });
  });

  describe("Value Objects", () => {
    it("Email.create rejette les emails mal formés", () => {
      expect(Email.create("invalid")).toBeNull();
      expect(Email.create("")).toBeNull();
      expect(Email.create("a@b")).toBeNull();
    });

    it("Email.create accepte et normalise", () => {
      const email = Email.create("  Test@Example.COM  ");
      expect(email).not.toBeNull();
      expect(email?.value).toBe("test@example.com");
    });

    it("TimeSlot détecte les chevauchements", () => {
      const slot1 = TimeSlot.create(
        new Date("2026-01-01T10:00:00Z"),
        new Date("2026-01-01T12:00:00Z")
      )!;
      const slot2 = TimeSlot.create(
        new Date("2026-01-01T11:00:00Z"),
        new Date("2026-01-01T13:00:00Z")
      )!;
      const slot3 = TimeSlot.create(
        new Date("2026-01-01T12:00:00Z"),
        new Date("2026-01-01T14:00:00Z")
      )!;

      expect(slot1.overlaps(slot2)).toBe(true);
      expect(slot1.overlaps(slot3)).toBe(false);
    });
  });
});
