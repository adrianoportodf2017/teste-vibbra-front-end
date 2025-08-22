import { useState } from 'react';
import { Button } from '../../components/ui';
import { InviteForm, InviteTable } from '../../components/invites';

export default function InvitesPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Meus convites</h1>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="bg-gray-900 text-white hover:bg-black"
        >
          {showForm ? 'Cancelar' : 'Novo convite'}
        </Button>
      </div>

      {showForm ? <InviteForm /> : <InviteTable />}
    </div>
  );
}
