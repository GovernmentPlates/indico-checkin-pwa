import eruda from 'eruda';
import {Button, Typography} from '../Tailwind';

function toggleEruda() {
  eruda.init();
  const erudaInstance = eruda.get();

  if (erudaInstance) {
    // Hide the entry button (the floating toggle button)
    const entryBtn = document.querySelector('.eruda-entry-btn') as HTMLElement;
    if (entryBtn) {
      entryBtn.style.display = 'none';
    }
    erudaInstance.show();
  }
}

export function DevToolsTab() {
  return (
    <div>
      <Typography variant="h4" className="text-gray-900 dark:text-white">
        Dev Tools
      </Typography>
      <div className="flex h-full items-center justify-center">
        <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
          This lets you open a mobile dev tools window to inspect the app (similar to Chrome
          DevTools).
        </Typography>
        <Button
          variant="default"
          className="mt-4"
          onClick={() => {
            toggleEruda();
          }}
        >
          Open Dev Tools
        </Button>
      </div>
    </div>
  );
}
