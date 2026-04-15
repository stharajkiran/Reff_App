import { useEffect, useState } from "react";
import { useSettings } from "../hooks/useSettings";

function SettingsPage() {
    const { settings, updateSettings } = useSettings();

    // local copy of settings for form editing
    const [localSettings, setLocalSettings] = useState(settings)

    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')


    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    // Handler for form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            [name]: value // This dynamically targets 'recipientEmail', 'senderName', etc.
        }));
    };

    const handleSave = () => {
        if (!localSettings.recipientEmail.includes('@')) {
            setSaveStatus('error')
            return;
        }
        updateSettings(localSettings)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 3000) // reset after 3 seconds
    }

    return (
        <main className="settings-page">
            <h1>Settings</h1>
            <div className="settings-form">
                <label>
                    Sender Name:
                    <input
                        type="text"
                        name="senderName"
                        value={localSettings.senderName}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    Recipient Email:
                    <input
                        type="email"
                        name="recipientEmail"
                        value={localSettings.recipientEmail}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    CC Email (optional):
                    <input
                        type="email"
                        name="ccEmail"
                        value={localSettings.ccEmail}
                        onChange={handleChange}
                    />
                </label>
                <button onClick={handleSave}>Save</button>
                {saveStatus === 'saved' && <p className="success">Settings saved successfully!</p>}
                {saveStatus === 'error' && <p className="error">Please enter a valid email address.</p>}
            </div>
        </main>

    )

}

export default SettingsPage;