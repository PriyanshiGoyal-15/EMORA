"use client";

import React, { useState } from 'react';
import SettingsLayout from '@/components/Settings/SettingsLayout';
import ProfileSettings from '@/components/Settings/ProfileSettings';
import PasswordSettings from '@/components/Settings/PasswordSettings';

type Section = 'profile' | 'notifications' | 'appearance' | 'password';

const PlaceholderSection = ({ title, icon }: { title: string, icon: string }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mb-4 text-2xl">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-navy">{title}</h3>
        <p className="text-gray-500 max-w-xs mt-2">This section is coming soon. Stay tuned for updates!</p>
    </div>
);

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState<Section>('profile');

    const renderSection = () => {
        switch (activeSection) {
            case 'profile':
                return <ProfileSettings />;
            case 'password':
                return <PasswordSettings />;
            case 'notifications':
                return <PlaceholderSection title="Notifications" icon="🔔" />;
            case 'appearance':
                return <PlaceholderSection title="Appearance" icon="🎨" />;
            // case 'billing':
            //     return <PlaceholderSection title="Billing & Plans" icon="💳" />;
            default:
                return <ProfileSettings />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-navy tracking-tight">Settings</h1>
                <p className="text-gray-500 font-medium">Manage your profile, security, and account preferences.</p>
            </div>
            <SettingsLayout activeSection={activeSection} onSectionChange={setActiveSection}>
                {renderSection()}
            </SettingsLayout>
        </div>
    );
}