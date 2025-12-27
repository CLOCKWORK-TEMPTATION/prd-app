/**
 * Digest Settings Component - Section 18
 * UI for configuring weekly digest email preferences
 */

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Bell,
  Clock,
  Calendar,
  Save,
  RotateCcw,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  AlertCircle,
  TrendingUp,
  Target,
  Lightbulb,
  Award,
} from 'lucide-react';
import {
  DigestSettings as DigestSettingsType,
  DigestFrequency,
  DigestContent,
  UserActivity,
} from '../types/email.types';
import { emailService } from '../services/emailService';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const FREQUENCIES: { value: DigestFrequency; label: string; description: string }[] = [
  { value: 'daily', label: 'Daily', description: 'Get updates every day' },
  { value: 'weekly', label: 'Weekly', description: 'Perfect for regular check-ins' },
  { value: 'biweekly', label: 'Bi-weekly', description: 'Every two weeks' },
  { value: 'monthly', label: 'Monthly', description: 'Monthly summary' },
];

const DEFAULT_SETTINGS: DigestSettingsType = {
  enabled: false,
  frequency: 'weekly',
  dayOfWeek: 1, // Monday
  timeOfDay: '09:00',
  includeStats: true,
  includeTips: true,
  includeTrending: true,
  includeGoals: true,
  emailAddress: '',
};

export const DigestSettings: React.FC = () => {
  const [settings, setSettings] = useState<DigestSettingsType>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<DigestContent | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('digestSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // Validate email
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle save settings
  const handleSave = async () => {
    if (!isValidEmail(settings.emailAddress)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Save to localStorage (in production, would save to backend)
      localStorage.setItem('digestSettings', JSON.stringify(settings));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reset to defaults
  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default settings?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem('digestSettings');
      setSaveStatus('idle');
    }
  };

  // Generate preview
  const handlePreview = async () => {
    setIsPreviewOpen(true);

    // Mock user activity data
    const mockActivity: UserActivity = {
      userId: 'mock-user',
      prdsCreated: 3,
      prototypesGenerated: 2,
      researchesConducted: 5,
      timeSpent: 180, // 3 hours
      lastActive: new Date(),
      streak: 5,
    };

    const content = await emailService.generateDigestContent('mock-user', mockActivity);
    content.user.email = settings.emailAddress;
    setPreviewContent(content);
  };

  // Send test email
  const handleSendTest = async () => {
    if (!isValidEmail(settings.emailAddress)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    setIsSendingTest(true);

    try {
      const mockActivity: UserActivity = {
        userId: 'mock-user',
        prdsCreated: 3,
        prototypesGenerated: 2,
        researchesConducted: 5,
        timeSpent: 180,
        lastActive: new Date(),
        streak: 5,
      };

      const content = await emailService.generateDigestContent('mock-user', mockActivity);
      content.user.email = settings.emailAddress;

      await emailService.sendDigest(settings.emailAddress, content);

      alert('Test email sent successfully! Check your inbox.');
    } catch (error) {
      alert('Failed to send test email. Please try again.');
    } finally {
      setIsSendingTest(false);
    }
  };

  const renderPreviewModal = () => {
    if (!isPreviewOpen || !previewContent) return null;

    const template = emailService.createEmailTemplate(previewContent);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Email Preview
            </h2>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 bg-gray-50 border-b">
            <p className="text-sm">
              <strong>Subject:</strong> {template.subject}
            </p>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div dangerouslySetInnerHTML={{ __html: template.htmlBody }} />
          </div>

          <div className="p-4 border-t flex justify-end gap-2">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={handleSendTest}
              disabled={isSendingTest}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              {isSendingTest ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Test Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Mail className="w-6 h-6" />
          Weekly Digest Settings
        </h1>
        <p className="text-gray-600">
          Stay engaged with weekly summaries of your activity, progress, and tips
        </p>
      </div>

      <div className="space-y-6">
        {/* Enable/Disable */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Enable Weekly Digest</h3>
                <p className="text-sm text-gray-600">
                  Receive regular updates about your activity and progress
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) =>
                  setSettings({ ...settings, enabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>

        {/* Email Address */}
        <div className="bg-white border rounded-lg p-6">
          <label className="block mb-2 font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address
          </label>
          <input
            type="email"
            value={settings.emailAddress}
            onChange={(e) => {
              setSettings({ ...settings, emailAddress: e.target.value });
              setEmailError('');
            }}
            placeholder="your@email.com"
            className={`w-full px-4 py-2 border rounded ${
              emailError ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {emailError && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {emailError}
            </p>
          )}
        </div>

        {/* Frequency */}
        <div className="bg-white border rounded-lg p-6">
          <label className="block mb-3 font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Frequency
          </label>
          <div className="grid grid-cols-2 gap-3">
            {FREQUENCIES.map((freq) => (
              <label
                key={freq.value}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  settings.frequency === freq.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <input
                  type="radio"
                  name="frequency"
                  value={freq.value}
                  checked={settings.frequency === freq.value}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      frequency: e.target.value as DigestFrequency,
                    })
                  }
                  className="sr-only"
                />
                <div className="font-medium">{freq.label}</div>
                <div className="text-sm text-gray-600">{freq.description}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Schedule */}
        {settings.frequency === 'weekly' && (
          <div className="bg-white border rounded-lg p-6">
            <label className="block mb-3 font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Schedule
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-gray-600">Day of Week</label>
                <select
                  value={settings.dayOfWeek}
                  onChange={(e) =>
                    setSettings({ ...settings, dayOfWeek: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Time</label>
                <input
                  type="time"
                  value={settings.timeOfDay}
                  onChange={(e) =>
                    setSettings({ ...settings, timeOfDay: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content Options */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4">What to Include</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeStats}
                onChange={(e) =>
                  setSettings({ ...settings, includeStats: e.target.checked })
                }
                className="w-4 h-4 text-blue-500"
              />
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="font-medium">Activity Statistics</div>
                <div className="text-sm text-gray-600">
                  PRDs created, time spent, productivity trends
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeGoals}
                onChange={(e) =>
                  setSettings({ ...settings, includeGoals: e.target.checked })
                }
                className="w-4 h-4 text-blue-500"
              />
              <Target className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <div className="font-medium">Goal Progress</div>
                <div className="text-sm text-gray-600">
                  Track your progress towards goals
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeTrending}
                onChange={(e) =>
                  setSettings({ ...settings, includeTrending: e.target.checked })
                }
                className="w-4 h-4 text-blue-500"
              />
              <Award className="w-5 h-5 text-orange-500" />
              <div className="flex-1">
                <div className="font-medium">Trending Templates</div>
                <div className="text-sm text-gray-600">
                  Popular templates from the community
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeTips}
                onChange={(e) =>
                  setSettings({ ...settings, includeTips: e.target.checked })
                }
                className="w-4 h-4 text-blue-500"
              />
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <div className="flex-1">
                <div className="font-medium">Tips & Tricks</div>
                <div className="text-sm text-gray-600">
                  Weekly productivity tips and feature highlights
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePreview}
            className="flex-1 px-6 py-3 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2 font-medium"
          >
            <Eye className="w-5 h-5" />
            Preview Email
          </button>

          <button
            onClick={handleReset}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            title="Reset to defaults"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {isSaving ? (
              <>
                <Clock className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Saved!
              </>
            ) : saveStatus === 'error' ? (
              <>
                <XCircle className="w-5 h-5" />
                Error
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
        </div>

        {/* Status Message */}
        {settings.enabled && settings.frequency === 'weekly' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Digest Enabled</p>
              <p className="text-sm text-blue-700">
                You'll receive an email every {DAYS_OF_WEEK[settings.dayOfWeek].label} at{' '}
                {settings.timeOfDay}
              </p>
            </div>
          </div>
        )}
      </div>

      {renderPreviewModal()}
    </div>
  );
};

export default DigestSettings;
