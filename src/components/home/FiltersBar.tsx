// src/components/home/FiltersBar.tsx
import React from 'react';
import type { DealType } from '../../types';

type Props = {
  term: string; setTerm: (v: string) => void;
  type: DealType | ''; setType: (v: DealType | '' ) => void;
  valueStart: string; setValueStart: (v: string) => void;
  valueEnd: string; setValueEnd: (v: string) => void;
  onApply: () => void;
};

export function FiltersBar({
  term, setTerm, type, setType, valueStart, setValueStart, valueEnd, setValueEnd, onApply
}: Props) {
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    onApply();
  }

  return (
    <form onSubmit={onSubmit}
      className="grid grid-cols-1 gap-3 rounded-xl border bg-white p-3 shadow-sm
                 dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-2 lg:grid-cols-6">
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Buscar</label>
        <input
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
                     dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          placeholder="Notebook, mouse..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Tipo</label>
        <select
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
                     dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          value={type as any}
          onChange={(e) => setType((e.target.value ? Number(e.target.value) : '') as any)}
        >
          <option value="">Todos</option>
          <option value="1">Venda</option>
          <option value="2">Troca</option>
          <option value="3">Desejo</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Preço mín.</label>
        <input
          type="number"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
                     dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          placeholder="0"
          value={valueStart}
          onChange={(e) => setValueStart(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Preço máx.</label>
        <input
          type="number"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
                     dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          placeholder="10000"
          value={valueEnd}
          onChange={(e) => setValueEnd(e.target.value)}
        />
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
          Aplicar
        </button>
      </div>
    </form>
  );
}
