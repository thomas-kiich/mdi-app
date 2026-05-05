/**
 * Admin-Zahlungsübersicht
 *
 * Zeigt:
 * - Statistik-Karten (aktive Abos, Umsatz)
 * - RAUM 36 Abonnenten-Tabelle
 * - Stimmklanganalyse-Bestellungen-Tabelle
 */

import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ArrowLeft, CreditCard, Users, TrendingUp, Mic } from "lucide-react";
import { Link } from "wouter";

function formatDate(d: Date | null | undefined): string {
  if (!d) return "–";
  return new Date(d).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active:    { label: "Aktiv",       className: "bg-green-900/50 text-green-400 border-green-800" },
    inactive:  { label: "Inaktiv",     className: "bg-zinc-800 text-zinc-400 border-zinc-700" },
    cancelled: { label: "Gekündigt",   className: "bg-red-900/50 text-red-400 border-red-800" },
    past_due:  { label: "Überfällig",  className: "bg-amber-900/50 text-amber-400 border-amber-800" },
    paid:      { label: "Bezahlt",     className: "bg-green-900/50 text-green-400 border-green-800" },
    pending:   { label: "Ausstehend",  className: "bg-amber-900/50 text-amber-400 border-amber-800" },
    refunded:  { label: "Erstattet",   className: "bg-zinc-800 text-zinc-400 border-zinc-700" },
  };
  const cfg = map[status] ?? { label: status, className: "bg-zinc-800 text-zinc-400 border-zinc-700" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

export default function AdminZahlungen() {
  const { user, isAuthenticated } = useAuth();

  const { data: stats, isLoading: statsLoading } = trpc.raum36.adminGetZahlungsStats.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );
  const { data: subscriptions, isLoading: subsLoading } = trpc.raum36.adminGetSubscriptions.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );
  const { data: orders, isLoading: ordersLoading } = trpc.raum36.adminGetStimmklangOrders.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-500">Kein Zugriff.</p>
      </div>
    );
  }

  const isLoading = statsLoading || subsLoading || ordersLoading;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center gap-4">
        <Link href="/admin">
          <button className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Admin
          </button>
        </Link>
        <span className="text-zinc-700">/</span>
        <h1 className="text-white font-bold">Zahlungsübersicht</h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* Statistik-Karten */}
        {isLoading ? (
          <div className="flex items-center gap-2 text-zinc-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Lade Daten…</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-zinc-800 p-5">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-widest mb-3">
                <Users className="w-3.5 h-3.5" />
                RAUM 36 Aktiv
              </div>
              <div className="text-3xl font-black text-white">{stats?.raum36ActiveCount ?? 0}</div>
              <div className="text-zinc-600 text-xs mt-1">von {stats?.raum36TotalCount ?? 0} gesamt</div>
            </div>

            <div className="border border-zinc-800 p-5">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-widest mb-3">
                <TrendingUp className="w-3.5 h-3.5" />
                RAUM 36 Umsatz
              </div>
              <div className="text-3xl font-black text-orange-500">
                € {(stats?.raum36MonthlyRevenue ?? 0).toFixed(2).replace(".", ",")}
              </div>
              <div className="text-zinc-600 text-xs mt-1">pro Monat (recurring)</div>
            </div>

            <div className="border border-zinc-800 p-5">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-widest mb-3">
                <Mic className="w-3.5 h-3.5" />
                Stimmklang Käufe
              </div>
              <div className="text-3xl font-black text-white">{stats?.stimmklangPaidCount ?? 0}</div>
              <div className="text-zinc-600 text-xs mt-1">von {stats?.stimmklangTotalCount ?? 0} gesamt</div>
            </div>

            <div className="border border-zinc-800 p-5">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-widest mb-3">
                <CreditCard className="w-3.5 h-3.5" />
                Stimmklang Umsatz
              </div>
              <div className="text-3xl font-black text-orange-500">
                € {(stats?.stimmklangRevenue ?? 0).toFixed(2).replace(".", ",")}
              </div>
              <div className="text-zinc-600 text-xs mt-1">Einmalzahlungen gesamt</div>
            </div>
          </div>
        )}

        {/* RAUM 36 Abonnenten */}
        <div>
          <h2 className="text-xl font-black mb-4 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            RAUM 36 Abonnenten
          </h2>
          {subsLoading ? (
            <div className="flex items-center gap-2 text-zinc-500 py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Lade…</span>
            </div>
          ) : !subscriptions || subscriptions.length === 0 ? (
            <div className="border border-zinc-800 p-8 text-center text-zinc-600 text-sm">
              Noch keine Abonnenten.
            </div>
          ) : (
            <div className="border border-zinc-800 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-500 font-mono text-xs uppercase">Name</TableHead>
                    <TableHead className="text-zinc-500 font-mono text-xs uppercase">E-Mail</TableHead>
                    <TableHead className="text-zinc-500 font-mono text-xs uppercase">Pseudonym</TableHead>
                    <TableHead className="text-zinc-500 font-mono text-xs uppercase">Status</TableHead>
                    <TableHead className="text-zinc-500 font-mono text-xs uppercase">Aktiviert</TableHead>
                    <TableHead className="text-zinc-500 font-mono text-xs uppercase">Stripe Sub-ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id} className="border-zinc-800 hover:bg-zinc-900/50">
                      <TableCell className="text-white font-medium">
                        {sub.userName ?? <span className="text-zinc-600">–</span>}
                      </TableCell>
                      <TableCell className="text-zinc-400 text-sm">
                        {sub.userEmail ?? <span className="text-zinc-600">–</span>}
                      </TableCell>
                      <TableCell className="text-zinc-400 text-sm font-mono">
                        {sub.pseudonym ?? <span className="text-zinc-600">–</span>}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={sub.status} />
                      </TableCell>
                      <TableCell className="text-zinc-500 text-sm">
                        {formatDate(sub.activatedAt)}
                      </TableCell>
                      <TableCell className="text-zinc-600 text-xs font-mono truncate max-w-[160px]">
                        {sub.stripeSubscriptionId
                          ? <span title={sub.stripeSubscriptionId}>{sub.stripeSubscriptionId.slice(0, 20)}…</span>
                          : "–"
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Stimmklanganalyse Bestellungen */}
        <div>
          <h2 className="text-xl font-black mb-4 tracking-tight flex items-center gap-2">
            <Mic className="w-5 h-5 text-orange-500" />
            Stimmklanganalyse – Bestellungen
          </h2>
          {ordersLoading ? (
            <div className="flex items-center gap-2 text-zinc-500 py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Lade…</span>
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="border border-zinc-800 p-8 text-center text-zinc-600 text-sm">
              Noch keine Bestellungen.
            </div>
          ) : (
            <div className="border border-zinc-800 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-500 font-mono text-xs uppercase">Name</TableHead>
                    <TableHead className="text-zinc-500 font-mono text-xs uppercase">E-Mail</TableHead>
                    <TableHead className="text-zinc-500 font-mono text-xs uppercase">Status</TableHead>
                    <TableHead className="text-zinc-500 font-mono text-xs uppercase">Bezahlt am</TableHead>
                    <TableHead className="text-zinc-500 font-mono text-xs uppercase">Betrag</TableHead>
                    <TableHead className="text-zinc-500 font-mono text-xs uppercase">Stripe PI-ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="border-zinc-800 hover:bg-zinc-900/50">
                      <TableCell className="text-white font-medium">
                        {order.userName ?? <span className="text-zinc-600">–</span>}
                      </TableCell>
                      <TableCell className="text-zinc-400 text-sm">
                        {order.userEmail ?? <span className="text-zinc-600">–</span>}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-zinc-500 text-sm">
                        {formatDate(order.paidAt)}
                      </TableCell>
                      <TableCell className="text-orange-500 font-bold text-sm">
                        {order.status === "paid" ? "€ 150,00" : "–"}
                      </TableCell>
                      <TableCell className="text-zinc-600 text-xs font-mono truncate max-w-[160px]">
                        {order.stripePaymentIntentId
                          ? <span title={order.stripePaymentIntentId}>{order.stripePaymentIntentId.slice(0, 20)}…</span>
                          : "–"
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Hinweis */}
        <div className="border border-zinc-800 p-4 text-zinc-600 text-xs">
          <strong className="text-zinc-500">Hinweis:</strong> Diese Übersicht zeigt den gecachten Status aus der KIICH-Datenbank.
          Die vollständige Zahlungshistorie und alle Details sind im{" "}
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:text-orange-400 underline"
          >
            Stripe-Dashboard
          </a>{" "}
          einsehbar.
        </div>
      </div>
    </div>
  );
}
