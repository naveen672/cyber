import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const SettingsPage = () => {
  const username = localStorage.getItem('username') || 'Admin User';
  const userEmail = localStorage.getItem('userEmail') || 'user@cybershield.ai';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordSuccess('✓ Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Account Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <span className="material-icons mr-2 text-cyan-400">person</span>
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-300">Username</Label>
                <Input
                  type="text"
                  value={username}
                  disabled
                  className="bg-slate-700 border-slate-600 text-slate-300 cursor-not-allowed mt-2"
                />
                <p className="text-xs text-slate-400 mt-2">Your username cannot be changed</p>
              </div>
              <div>
                <Label className="text-slate-300">Email Address</Label>
                <Input
                  type="email"
                  value={userEmail}
                  disabled
                  className="bg-slate-700 border-slate-600 text-slate-300 cursor-not-allowed mt-2"
                />
                <p className="text-xs text-slate-400 mt-2">Contact support to change email</p>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="material-icons text-blue-400 text-sm">info</span>
                <p className="text-blue-300 text-sm">Your account is secure and verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <span className="material-icons mr-2 text-cyan-400">security</span>
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Change Password */}
            <div>
              <h3 className="text-white font-semibold mb-4">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label className="text-slate-300">Current Password</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 mt-2"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 mt-2"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Confirm New Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 mt-2"
                  />
                </div>

                {passwordError && (
                  <Alert className="border-red-500/50 bg-red-500/10">
                    <span className="material-icons text-red-400 text-sm">error</span>
                    <AlertDescription className="text-red-300 ml-2">
                      {passwordError}
                    </AlertDescription>
                  </Alert>
                )}

                {passwordSuccess && (
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <span className="material-icons text-green-400 text-sm">check_circle</span>
                    <AlertDescription className="text-green-300 ml-2">
                      {passwordSuccess}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <span className="material-icons text-sm mr-2">lock</span>
                  Update Password
                </Button>
              </form>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-white font-semibold mb-4">Two-Factor Authentication</h3>
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-slate-300">Enable 2FA for enhanced security</p>
                  <p className="text-slate-400 text-sm">Protect your account with an additional verification step</p>
                </div>
                <Button disabled className="bg-slate-600 text-slate-400 cursor-not-allowed">
                  Coming Soon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Notifications */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <span className="material-icons mr-2 text-cyan-400">notifications</span>
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { label: 'Critical Threat Alerts', enabled: true },
                { label: 'Daily Security Report', enabled: true },
                { label: 'Weekly Summary', enabled: false },
                { label: 'Marketing Updates', enabled: false }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-300">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      defaultChecked={item.enabled}
                      className="w-4 h-4 rounded accent-cyan-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <span className="material-icons mr-2 text-cyan-400">info</span>
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <p className="text-slate-400 text-sm">Platform Version</p>
                <p className="text-white font-semibold">v2.1.0</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <p className="text-slate-400 text-sm">Last Updated</p>
                <p className="text-white font-semibold">Nov 28, 2025</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <p className="text-slate-400 text-sm">API Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-white font-semibold">Operational</p>
                </div>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <p className="text-slate-400 text-sm">Database Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-white font-semibold">Connected</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;
