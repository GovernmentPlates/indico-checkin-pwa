import {Log} from '../../context/LogsProvider';
import {Typography} from '../Tailwind';

interface LogsTabProps {
  logs: Log[];
  logEndRef: React.RefObject<HTMLDivElement>;
}

export function LogsTab({logs, logEndRef}: LogsTabProps) {
  if (logs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
          No logs available
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 font-mono text-xs">
      {logs.map((log, idx) => (
        <LogEntry key={idx} log={log} />
      ))}
      <div ref={logEndRef} />
    </div>
  );
}

function LogEntry({log}: {log: Log}) {
  const getSeverityColor = (severity: Log['severity']) => {
    switch (severity) {
      case 'error':
        return 'text-red-500 dark:text-red-400';
      case 'warn':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const timestamp = log.timestamp.toISOString().slice(11, 23); // HH:MM:SS.mmm

  return (
    <div className="flex gap-2 leading-relaxed">
      <span className="text-gray-400 dark:text-gray-500">{timestamp}</span>
      <span className={`w-12 font-bold ${getSeverityColor(log.severity)}`}>
        {log.severity.toUpperCase()}
      </span>
      <span className="flex-1 break-all text-gray-700 dark:text-gray-200">{log.message}</span>
    </div>
  );
}
