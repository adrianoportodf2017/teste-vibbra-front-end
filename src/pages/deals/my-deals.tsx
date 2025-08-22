import DealTable from '../../components/deals/table/DealTable';

export default function MyDealsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Minhas negociações</h1>
      <DealTable />
    </div>
  );
}
