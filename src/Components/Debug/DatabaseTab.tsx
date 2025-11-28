import {useState} from 'react';
import {ChevronDownIcon} from '@heroicons/react/20/solid';
import {useLiveQuery} from 'dexie-react-hooks';
import db from '../../db/db';
import {Typography} from '../Tailwind';

export function DatabaseTab() {
  const servers = useLiveQuery(() => db.servers.toArray()) || [];
  const events = useLiveQuery(() => db.events.toArray()) || [];
  const regforms = useLiveQuery(() => db.regforms.toArray()) || [];
  const participants = useLiveQuery(() => db.participants.count()) || 0;

  const tables = [
    {name: 'Servers', count: servers.length, data: servers},
    {name: 'Events', count: events.length, data: events},
    {name: 'Regforms', count: regforms.length, data: regforms},
    {name: 'Participants', count: participants, data: null},
  ];

  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <Typography variant="h4" className="text-gray-900 dark:text-white">
        IndexedDB Tables
      </Typography>
      <div className="space-y-2">
        {tables.map(({name, count, data}) => (
          <div key={name} className="rounded-lg bg-gray-50 dark:bg-gray-800">
            <button
              onClick={() => setExpandedTable(expandedTable === name ? null : name)}
              className="flex w-full items-center justify-between p-3"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300">{name}</span>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {count}
                </span>
                <ChevronDownIcon
                  className={`h-4 w-4 text-gray-500 transition-transform dark:text-gray-400 ${
                    expandedTable === name ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>
            {expandedTable === name && data && (
              <div className="border-t px-3 pb-3 pt-2">
                <pre className="overflow-x-auto rounded bg-white p-2 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
