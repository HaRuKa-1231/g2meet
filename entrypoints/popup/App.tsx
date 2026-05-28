import { useEffect, useRef, useState } from 'react';
import { t } from '@/utils/i18n';
import type { Detection } from '@/utils/types';
import { selectView } from '@/utils/view';
import './App.css';

function App() {
  const [detection, setDetection] = useState<Detection | null>(null);
  const [meetUrl, setMeetUrl] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [status, setStatus] = useState<string>('');
  const debugClicks = useRef(0);
  const [debugVisible, setDebugVisible] = useState(false);

  useEffect(() => {
    Promise.all([
      chrome.storage.local.get(['meetUrl', 'enabled']),
      chrome.storage.session.get('detection'),
    ]).then(([{ meetUrl, enabled }, { detection }]) => {
      setDetection((detection as Detection | undefined) ?? null);
      setMeetUrl((meetUrl as string | undefined) ?? null);
      setEnabled(enabled === undefined ? true : Boolean(enabled));
    });

    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName === 'session' && 'detection' in changes) {
        setDetection((changes.detection.newValue as Detection | null) ?? null);
      }
      if (areaName === 'local' && 'meetUrl' in changes) {
        setMeetUrl((changes.meetUrl.newValue as string | null) ?? null);
      }
      if (areaName === 'local' && 'enabled' in changes) {
        setEnabled(changes.enabled.newValue === false ? false : true);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const toggleEnabled = async () => {
    const next = !enabled;
    setEnabled(next);
    await chrome.storage.local.set({ enabled: next });
  };

  const suppress = async (minutes: number) => {
    await chrome.runtime.sendMessage({ type: 'suppress', minutes });
    setStatus(t('status_suppressed', { n: minutes }));
    setTimeout(() => window.close(), 700);
  };

  const dismiss = async () => {
    await chrome.runtime.sendMessage({ type: 'dismiss' });
    window.close();
  };

  const createMeet = async () => {
    await chrome.runtime.sendMessage({ type: 'create-meet' });
    setStatus(t('status_creating_meet'));
    setTimeout(() => window.close(), 400);
  };

  const copyMeetUrl = async () => {
    if (!meetUrl) return;
    await navigator.clipboard.writeText(meetUrl);
    setStatus(t('status_url_copied'));
  };

  const testFire = async () => {
    if (!import.meta.env.DEV) return;
    await chrome.runtime.sendMessage({ type: 'test-fire' });
    setStatus(t('status_test_fired'));
  };

  const onTitleClick = () => {
    debugClicks.current += 1;
    if (debugClicks.current >= 5) setDebugVisible(true);
  };

  return (
    <div className="st-popup">
      <header className="st-header">
        <h3 className="st-title" onClick={onTitleClick}>
          {t('app_name')}
        </h3>
        <label className="st-toggle">
          <input type="checkbox" checked={enabled} onChange={toggleEnabled} />
          <span>{enabled ? t('toggle_on') : t('toggle_off')}</span>
        </label>
      </header>

      <Body
        detection={detection}
        meetUrl={meetUrl}
        debugVisible={debugVisible}
        actions={{ createMeet, copyMeetUrl, dismiss, suppress, testFire }}
      />

      {status && <p className="st-status">{status}</p>}
    </div>
  );
}

type Actions = {
  createMeet: () => void;
  copyMeetUrl: () => void;
  dismiss: () => void;
  suppress: (n: number) => void;
  testFire: () => void;
};

function Body({
  detection,
  meetUrl,
  debugVisible,
  actions,
}: {
  detection: Detection | null;
  meetUrl: string | null;
  debugVisible: boolean;
  actions: Actions;
}) {
  const view = selectView(detection, meetUrl);

  if (view === 'meet' && meetUrl) {
    return (
      <>
        <h4 className="st-section-title">{t('section_meet_created')}</h4>
        <p className="st-desc">{t('section_meet_body')}</p>
        <code className="st-url">{meetUrl}</code>
        <div className="st-row">
          <button className="st-btn st-btn-primary" onClick={actions.copyMeetUrl}>
            {t('btn_copy_url')}
          </button>
          <button className="st-btn st-btn-ghost" onClick={actions.dismiss}>
            {t('btn_close')}
          </button>
        </div>
      </>
    );
  }

  if (view === 'detecting' && detection) {
    return (
      <>
        <h4 className="st-section-title">{t('section_detected')}</h4>
        <p className="st-desc">{t('toast_detected_body')}</p>
        <div className="st-row">
          <button className="st-btn st-btn-primary" onClick={actions.createMeet}>
            {t('btn_start_meet')}
          </button>
        </div>
        <div className="st-row">
          <button className="st-btn st-btn-ghost" onClick={actions.dismiss}>
            {t('btn_close')}
          </button>
          <button className="st-btn st-btn-ghost" onClick={() => actions.suppress(5)}>
            {t('btn_suppress_5')}
          </button>
          <button className="st-btn st-btn-ghost" onClick={() => actions.suppress(10)}>
            {t('btn_suppress_10')}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="st-desc">{t('desc_idle')}</p>
      <div className="st-row">
        <button className="st-btn st-btn-primary" onClick={actions.createMeet}>
          {t('btn_start_meet')}
        </button>
      </div>
      {import.meta.env.DEV && debugVisible && (
        <div className="st-row">
          <button className="st-btn st-btn-ghost" onClick={actions.testFire}>
            {t('test_fire')}
          </button>
        </div>
      )}
    </>
  );
}

export default App;
