import useSettings from '../../hooks/useSettings';
import {Typography} from '../Tailwind';

export function SettingsTab() {
  const settings = useSettings();

  // Programmatically generate settings entries from the context
  // Filter out setter functions (keys starting with 'set')
  const settingsEntries = Object.entries(settings)
    .filter(([key]) => !key.startsWith('set'))
    .map(([key, value]) => ({
      key: key
        // Convert camelCase to Title Case with spaces
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim(),
      rawKey: key,
      value,
    }));

  return (
    <div className="space-y-3">
      <Typography variant="h4" className="text-gray-900 dark:text-white">
        Current Settings
      </Typography>
      <div className="space-y-2">
        {settingsEntries.map(({key, rawKey, value}) => (
          <div
            key={rawKey}
            className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
          >
            <span className="font-medium text-gray-700 dark:text-gray-300">{key}</span>
            <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
              {typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
