interface TabButtonProps {
  icon: React.ComponentType<{className?: string}>;
  count?: number;
  active: boolean;
  onClick: () => void;
}

export function TabButton({icon: Icon, count, active, onClick}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-white text-gray-900 dark:bg-gray-900 dark:text-white'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
      }`}
    >
      <Icon className="h-4 w-4" />
      {count !== undefined && (
        <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
          {count}
        </span>
      )}
    </button>
  );
}
