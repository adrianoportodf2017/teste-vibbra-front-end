 
type DeliveryPanelProps = {
  delivery: any; // pode vir {delivery:{...}, steps:[...]} OU {from,to,value,steps?}
  loading?: boolean;
  onRefresh?: () => Promise<void>;
  onCalculate?: (userId: number) => Promise<void>;
};

export default function DeliveryPanel({
  delivery,
  loading = false,
  onRefresh,
  onCalculate,
}: DeliveryPanelProps) {
  // Normaliza os dois formatos possíveis do mock
  const summary = delivery?.delivery ?? delivery ?? null; // {from,to,value,...}
  const steps: any[] =
    delivery?.steps ??
    delivery?.delivery?.steps ??
    summary?.steps ??
    [];

  const from = summary?.from;
  const to = summary?.to;
  const value = summary?.value;

  return (
    <div className="space-y-4 rounded-lg border p-4 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-2 text-lg font-semibold">Entrega</h2>

      {loading ? (
        <div className="text-gray-500">Carregando entrega...</div>
      ) : !summary ? (
        <div className="text-gray-500">Nenhum cálculo de entrega disponível.</div>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-500">Origem</div>
            <div className="text-sm font-medium">
              {from?.address
                ? `${from.address} - ${from.city}/${from.state}`
                : "—"}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Destino</div>
            <div className="text-sm font-medium">
              {to?.address ? `${to.address} - ${to.city}/${to.state}` : "—"}
            </div>
          </div>

          <div className="text-sm">
            <span className="font-semibold">Valor estimado: </span>
            {typeof value === "number" ? `R$ ${value.toFixed(2)}` : "—"}
          </div>

          {Array.isArray(steps) && steps.length > 0 && (
            <div className="mt-3">
              <div className="mb-1 text-sm font-semibold">Roteiro:</div>
              <ul className="space-y-1 text-sm">
                {steps.map((s, idx) => (
                  <li key={idx} className="pl-2 border-l">
                    <span className="font-medium">{s.location ?? "—"}</span>{" "}
                    — {s.incoming_date ?? "—"} → {s.outcoming_date ?? "—"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="rounded-md bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Recarregar
          </button>
        )}
        {onCalculate && (
          <button
            onClick={() => onCalculate(201)} // mock do usuário logado
            className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
          >
            Calcular entrega
          </button>
        )}
      </div>
    </div>
  );
}
