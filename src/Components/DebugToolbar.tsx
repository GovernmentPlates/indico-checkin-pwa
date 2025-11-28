import {useState, useEffect, useRef} from 'react';
import {
  XMarkIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  CircleStackIcon,
  InformationCircleIcon,
  BugAntIcon,
} from '@heroicons/react/20/solid';
import {useLogs} from '../hooks/useLogs';
import useSettings from '../hooks/useSettings';
import {DatabaseTab} from './Debug/DatabaseTab';
import {DevToolsTab} from './Debug/DevTools';
import {LogsTab} from './Debug/LogsTab';
import {SettingsTab} from './Debug/SettingsTab';
import {TabButton} from './Debug/TabButton';

type TabType = 'logs' | 'settings' | 'database' | 'devtools';

export default function DebugToolbar() {
  const {showDevDebugBar} = useSettings();
  const {logs} = useLogs();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('logs');
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (isOpen && activeTab === 'logs' && logEndRef.current) {
      logEndRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, [logs, isOpen, activeTab]);

  if (!showDevDebugBar) {
    return null;
  }

  return (
    <>
      {/* Floating Tab Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-[9999] flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-white shadow-lg transition-all hover:bg-blue-600 active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-700"
          aria-label="Open debug toolbar"
        >
          <BugAntIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Debug</span>
        </button>
      )}

      {/* Debug Window */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 z-[9999] flex h-1/3 flex-col border-t-2 border-blue-600 bg-white/95 backdrop-blur-sm dark:border-blue-500 dark:bg-gray-900/95">
          {/* Header with Tabs */}
          <div className="flex items-center justify-between border-b border-blue-600 bg-gray-100/90 dark:border-blue-500 dark:bg-gray-800/90">
            <div className="flex items-center gap-1 px-2">
              <TabButton
                icon={DocumentTextIcon}
                count={logs.length}
                active={activeTab === 'logs'}
                onClick={() => setActiveTab('logs')}
              />
              <TabButton
                icon={Cog6ToothIcon}
                active={activeTab === 'settings'}
                onClick={() => setActiveTab('settings')}
              />
              <TabButton
                icon={CircleStackIcon}
                active={activeTab === 'database'}
                onClick={() => setActiveTab('database')}
              />
              <TabButton
                icon={InformationCircleIcon}
                active={activeTab === 'devtools'}
                onClick={() => setActiveTab('devtools')}
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-2">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                aria-label="Close debug toolbar"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'logs' && <LogsTab logs={logs} logEndRef={logEndRef} />}
            {activeTab === 'settings' && <SettingsTab />}
            {activeTab === 'database' && <DatabaseTab />}
            {activeTab === 'devtools' && <DevToolsTab />}
          </div>
        </div>
      )}
    </>
  );
}
