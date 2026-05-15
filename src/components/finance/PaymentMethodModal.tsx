"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import { useToastStore } from "@/store/toastStore";
import type { PaymentMethod } from "@/store/financeStore";

const TYPE_ICONS: Record<string, string> = {
  card: "💳", upi: "📱", cash: "💵", netbanking: "🏦",
};

interface Props {
  method: PaymentMethod | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: Partial<PaymentMethod>) => Promise<void>;
  onDelete: (id: number) => void;
}

export default function PaymentMethodModal({ method, open, onClose, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState(method?.type ?? "card");
  const toast = useToastStore((s) => s.show);

  if (!method) return null;

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!method) return;
    setSaving(true);
    const form = new FormData(e.currentTarget);
    await onUpdate(method.id, {
      type: form.get("type") as string,
      label: form.get("label") as string,
      last_four: (form.get("last_four") as string) || undefined,
      upi_id: (form.get("upi_id") as string) || undefined,
      is_default: form.get("is_default") === "on",
    });
    setSaving(false);
    setEditing(false);
    toast("Payment method updated");
  }

  function handleDelete() {
    if (!method) return;
    onDelete(method.id);
    toast("Payment method deleted", "error");
    onClose();
  }

  return (
    <Modal open={open} onClose={() => { setEditing(false); onClose(); }} title={editing ? "Edit Payment Method" : "Payment Method"} width="sm">
      {editing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Type</label>
              <select name="type" value={type} onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="netbanking">Net Banking</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Label</label>
              <input name="label" required defaultValue={method.label}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
          </div>

          {type === "card" && (
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Last 4 digits</label>
              <input name="last_four" maxLength={4} pattern="\d{4}" defaultValue={method.last_four ?? ""}
                placeholder="e.g. 4242"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
          )}
          {type === "upi" && (
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">UPI ID</label>
              <input name="upi_id" defaultValue={method.upi_id ?? ""}
                placeholder="e.g. name@upi"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" name="is_default" defaultChecked={method.is_default ?? false} className="rounded" />
            Set as default
          </label>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg">
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button type="button" onClick={() => setEditing(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{TYPE_ICONS[method.type] ?? "💰"}</span>
            <div>
              <p className="text-base font-semibold text-slate-900">
                {method.label}
                {method.last_four && <span className="text-slate-400 ml-1 font-normal">••••{method.last_four}</span>}
              </p>
              <p className="text-xs text-slate-400 capitalize">{method.type}</p>
            </div>
            {method.is_default && (
              <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Default</span>
            )}
          </div>

          {method.upi_id && (
            <div className="bg-slate-50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-400">UPI ID</p>
              <p className="text-sm font-medium text-slate-700">{method.upi_id}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button onClick={() => { setType(method.type); setEditing(true); }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
              Edit
            </button>
            <button onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              Delete
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
