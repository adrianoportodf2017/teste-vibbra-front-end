
type Props = {
  value: 'nearby' | 'priceAsc' | 'priceDesc';
  onChange: (v: 'nearby' | 'priceAsc' | 'priceDesc') => void;
};

export function SortSelect({ value, onChange }: Props) {
  return (
    <select
      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
                 dark:border-gray-600 dark:bg-gray-800"
      value={value}
      onChange={(e) => onChange(e.target.value as any)}
      aria-label="Ordenar por"
    >
      <option value="nearby">Mais próximas</option>
      <option value="priceAsc">Menor preço</option>
      <option value="priceDesc">Maior preço</option>
    </select>
  );
}
