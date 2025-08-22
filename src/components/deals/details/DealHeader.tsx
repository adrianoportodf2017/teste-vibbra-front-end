import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { dealsService } from "../../../services/api";
import type { Deal } from "../../../types";

export default function DealHeader() {
  const { id } = useParams();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    dealsService
      .getDealById(Number(id))
      .then((res) => {
        setDeal(res.deal);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message ?? "Erro ao carregar negociação");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!deal) return null;

  const typeLabel =
    deal.type === 1 ? "Venda" : deal.type === 2 ? "Troca" : "Desejo";

  return (
    <div className="rounded-lg border p-4 bg-white dark:bg-gray-800 shadow">
      <h2 className="text-xl font-bold mb-2">{deal.description}</h2>
      <p className="text-gray-700 dark:text-gray-300">
        <strong>Tipo:</strong> {typeLabel}
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <strong>Preço:</strong>{" "}
        {deal.value > 0 ? `R$ ${deal.value.toFixed(2)}` : "—"}
      </p>
      {deal.trade_for && (
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Troca por:</strong> {deal.trade_for}
        </p>
      )}
      {deal.location && (
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Localização:</strong> {deal.location.city}/{deal.location.state}
        </p>
      )}
    </div>
  );
}
