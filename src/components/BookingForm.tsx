/**
 * BookingForm - Composant React strictement typé consommant le BookingService.
 * Isolation : le composant ne connaît que les types du domaine.
 * Styling : Tailwind CSS (classes utilitaires).
 */
import React, { useState } from "react";
import { BookingService, Result, Booking } from "../booking-service";
import { Email } from "../domain";

interface BookingFormProps {
  service: BookingService;
  userId: string;
  onSuccess?: (booking: Booking) => void;
  onError?: (message: string) => void;
}

interface FormState {
  email: string;
  start: string; // ISO datetime-local
  end: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  service,
  userId,
  onSuccess,
  onError,
}) => {
  const [form, setForm] = useState<FormState>({
    email: "",
    start: "",
    end: "",
  });
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<Result<Booking> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLastResult(null);

    try {
      const start = new Date(form.start);
      const end = new Date(form.end);

      const result = service.createBooking(userId, form.email, start, end);
      setLastResult(result);

      if (result.ok) {
        onSuccess?.(result.value);
        // Reset form
        setForm({ email: "", start: "", end: "" });
      } else {
        onError?.(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md space-y-4 border border-gray-200"
    >
      <h2 className="text-2xl font-semibold text-gray-800">Nouvelle réservation</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="vous@example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Début
          </label>
          <input
            type="datetime-local"
            name="start"
            value={form.start}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fin
          </label>
          <input
            type="datetime-local"
            name="end"
            value={form.end}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {loading ? "Création..." : "Réserver"}
      </button>

      {lastResult && (
        <div
          className={`p-3 rounded-md text-sm ${
            lastResult.ok
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {lastResult.ok
            ? `Réservation créée : ${lastResult.value.id}`
            : lastResult.error}
        </div>
      )}
    </form>
  );
};
