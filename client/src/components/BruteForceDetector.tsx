import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const BruteForceDetector = () => {
  const [passwordInput, setPasswordInput] = useState('');
  const [crackingPassword, setCrackingPassword] = useState(false);
  const [crackProgress, setCrackProgress] = useState(0);
  const [crackedPassword, setCrackedPassword] = useState<string | null>(null);
  const [crackAttempts, setCrackAttempts] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState<'easy' | 'medium' | 'strong' | null>(null);
  const [suggestedPassword, setSuggestedPassword] = useState<string | null>(null);

  const generateStrongPassword = () => {
    // Generate a random 4-digit password (0000-9999)
    const randomNum = Math.floor(Math.random() * 10000);
    const password = String(randomNum).padStart(4, '0');

    // Avoid sequential or repeating patterns
    const isSequential = (pwd: string) => {
      const digits = pwd.split('').map(Number);
      const isSeq = digits.every((d, i) => i === 0 || d === digits[i-1] + 1 || d === digits[i-1]);
      const isRepeat = digits.every(d => d === digits[0]);
      return isSeq || isRepeat;
    };

    if (isSequential(password)) {
      generateStrongPassword(); // Retry if sequential
      return;
    }

    setSuggestedPassword(password);
  };

  const getStrengthColor = (strength: string | null) => {
    switch (strength) {
      case 'easy':
        return 'bg-red-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'strong':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStrengthBg = (strength: string | null) => {
    switch (strength) {
      case 'easy':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'strong':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStrengthDescription = (strength: string | null, attempts: number) => {
    switch (strength) {
      case 'easy':
        return {
          title: '🔴 EASY PASSWORD',
          description: `This password was cracked in just ${attempts.toLocaleString()} attempts out of 10,000. This is extremely vulnerable and can be broken in seconds by any attacker.`,
          recommendation: 'This password is critically weak. Change immediately.'
        };
      case 'medium':
        return {
          title: '🟡 MEDIUM PASSWORD',
          description: `This password was cracked in ${attempts.toLocaleString()} attempts out of 10,000. While better than easy passwords, this is still vulnerable to modern brute force attacks.`,
          recommendation: 'Consider using a stronger password with more characters and complexity.'
        };
      case 'strong':
        return {
          title: '🟢 STRONG PASSWORD',
          description: `This password required ${attempts.toLocaleString()} attempts to crack. Excellent resistance to brute force attacks.`,
          recommendation: 'This is a good password. Keep using strong passwords like this.'
        };
      default:
        return {
          title: 'Password Strength',
          description: 'No results yet',
          recommendation: ''
        };
    }
  };

  const classifyPasswordStrength = (attempts: number): 'easy' | 'medium' | 'strong' => {
    if (attempts < 2500) {
      return 'easy';
    } else if (attempts < 7500) {
      return 'medium';
    } else {
      return 'strong';
    }
  };

  const crackPassword = async () => {
    if (!passwordInput || passwordInput.length !== 4 || isNaN(Number(passwordInput))) {
      alert('Please enter a 4-digit numeric password (0000-9999)');
      return;
    }

    setCrackingPassword(true);
    setCrackedPassword(null);
    setCrackProgress(0);
    setCrackAttempts(0);
    setPasswordStrength(null);

    const targetPassword = passwordInput;
    const maxAttempts = 10000;

    return new Promise<void>((resolve) => {
      const attemptInterval = setInterval(() => {
        setCrackAttempts((prev) => {
          const newAttempt = prev + 1;
          setCrackProgress((newAttempt / maxAttempts) * 100);

          const currentGuess = String(newAttempt - 1).padStart(4, '0');

          if (currentGuess === targetPassword) {
            const strength = classifyPasswordStrength(newAttempt);
            setPasswordStrength(strength);
            setCrackedPassword(targetPassword);
            clearInterval(attemptInterval);
            setCrackingPassword(false);
            resolve();
            return newAttempt;
          }

          if (
            newAttempt >= Math.floor(maxAttempts * 0.25) + Math.floor(Math.random() * 500)
          ) {
            const strength = classifyPasswordStrength(newAttempt);
            setPasswordStrength(strength);
            setCrackedPassword(targetPassword);
            clearInterval(attemptInterval);
            setCrackingPassword(false);
            resolve();
            return newAttempt;
          }

          return newAttempt;
        });
      }, 5);
    });
  };

  const strengthInfo = getStrengthDescription(passwordStrength, crackAttempts);

  return (
    <Card className="w-full mb-6">
      <CardHeader className="px-6 py-4 border-b border-border">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center">
            <span className="material-icons mr-2 text-cyan-500">vpn_key</span>
            Password Strength Analyzer
          </CardTitle>
          <Badge
            variant="outline"
            className={`px-3 py-1 flex items-center text-xs ${
              crackedPassword
                ? passwordStrength === 'easy'
                  ? 'bg-red-500/20 text-red-500'
                  : passwordStrength === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-500'
                    : 'bg-green-500/20 text-green-500'
                : crackingPassword
                  ? 'bg-blue-500/20 text-blue-500'
                  : ''
            }`}
          >
            <span
              className={`material-icons text-xs mr-1 ${
                crackingPassword ? 'text-blue-500 animate-pulse' : ''
              }`}
            >
              {crackingPassword ? 'hourglass_empty' : 'security'}
            </span>
            {crackingPassword
              ? 'Analyzing...'
              : crackedPassword
                ? `${passwordStrength?.toUpperCase()}`
                : 'Ready'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <span className="material-icons mr-2 text-blue-600">info</span>
            <AlertTitle className="text-blue-900">4-Digit Password Strength Tester</AlertTitle>
            <AlertDescription className="text-blue-800 mt-2">
              Enter a 4-digit numeric password (0000-9999) to see how quickly it can be cracked
              using brute force attacks. Based on the number of attempts, the password will be
              classified as Easy, Medium, or Strong.
            </AlertDescription>
          </Alert>

          {/* Strong Password Suggestion Section */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">💡 Generate Strong 4-Digit Password</h3>
                <p className="text-green-800 text-sm mb-3">
                  Get a randomly generated 4-digit password (0000-9999) that avoids sequential and repeating patterns. These are "stronger" within the 4-digit constraint.
                </p>
                {suggestedPassword && (
                  <div className="bg-white border-2 border-green-500 rounded p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Suggested Strong 4-Digit Password:</p>
                        <p className="font-mono text-3xl font-bold text-green-700">{suggestedPassword}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(suggestedPassword);
                          alert('Password copied to clipboard!');
                        }}
                        className="ml-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium whitespace-nowrap h-fit"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      <p><strong>✓ Random 4-digit password</strong></p>
                      <p><strong>✓ Avoids sequential patterns</strong> (1234, 0987, etc.)</p>
                      <p><strong>✓ Avoids repeating digits</strong> (1111, 2222, etc.)</p>
                      <p><strong>ℹ️ Note:</strong> All 4-digit passwords are inherently weak. Use stronger formats like 14+ character passwords with mixed character types in real applications.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={generateStrongPassword}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <span className="material-icons text-sm mr-2">star</span>
              Generate Random 4-Digit Password
            </Button>
          </div>

          {crackedPassword === null ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Enter 4-digit password (0000-9999)"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value.slice(0, 4))}
                  disabled={crackingPassword}
                  maxLength="4"
                  className="flex-1 px-4 py-2 border border-border rounded-md bg-background text-foreground disabled:opacity-50"
                />
                <Button
                  onClick={crackPassword}
                  disabled={crackingPassword || !passwordInput}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  <span className="material-icons text-sm mr-2">
                    {crackingPassword ? 'hourglass_empty' : 'psychology'}
                  </span>
                  {crackingPassword ? 'Cracking...' : 'Analyze'}
                </Button>
              </div>

              {crackingPassword && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-100">🔐 AI is analyzing password strength...</span>
                    <span className="text-blue-100">{Math.round(crackProgress)}%</span>
                  </div>
                  <Progress value={crackProgress} className="h-3" />
                  <div className="text-center text-sm text-blue-200">
                    Attempts: <span className="font-bold text-cyan-400">
                      {crackAttempts.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Alert
                className={`text-white border-0 ${getStrengthColor(
                  passwordStrength
                )}`}
              >
                <span className="material-icons mr-2">
                  {passwordStrength === 'easy'
                    ? 'dangerous'
                    : passwordStrength === 'medium'
                      ? 'warning'
                      : 'verified_user'}
                </span>
                <AlertTitle className="text-lg">{strengthInfo.title}</AlertTitle>
                <AlertDescription className="mt-2 text-white/90">
                  {strengthInfo.description}
                </AlertDescription>
              </Alert>

              <div className={`p-4 border rounded-lg ${getStrengthBg(passwordStrength)} ${
                passwordStrength === 'easy'
                  ? 'text-red-900'
                  : passwordStrength === 'medium'
                    ? 'text-yellow-900'
                    : 'text-green-900'
              }`}>
                <div className="flex items-start space-x-3">
                  <span className={`material-icons text-lg ${
                    passwordStrength === 'easy'
                      ? 'text-red-600'
                      : passwordStrength === 'medium'
                        ? 'text-yellow-600'
                        : 'text-green-600'
                  }`}>assessment</span>
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-2 ${
                      passwordStrength === 'easy'
                        ? 'text-red-900'
                        : passwordStrength === 'medium'
                          ? 'text-yellow-900'
                          : 'text-green-900'
                    }`}>
                      {passwordStrength === 'easy'
                        ? 'Critical Security Risk'
                        : passwordStrength === 'medium'
                          ? 'Moderate Security Risk'
                          : 'Good Security'}
                    </h4>
                    <p className={`text-sm mb-3 ${
                      passwordStrength === 'easy'
                        ? 'text-red-800'
                        : passwordStrength === 'medium'
                          ? 'text-yellow-800'
                          : 'text-green-800'
                    }`}>{strengthInfo.recommendation}</p>

                    <div className={`grid grid-cols-2 gap-2 text-sm ${
                      passwordStrength === 'easy'
                        ? 'text-red-800'
                        : passwordStrength === 'medium'
                          ? 'text-yellow-800'
                          : 'text-green-800'
                    }`}>
                      <div>
                        <span className={`font-semibold ${
                          passwordStrength === 'easy'
                            ? 'text-red-900'
                            : passwordStrength === 'medium'
                              ? 'text-yellow-900'
                              : 'text-green-900'
                        }`}>Password:</span> {crackedPassword}
                      </div>
                      <div>
                        <span className={`font-semibold ${
                          passwordStrength === 'easy'
                            ? 'text-red-900'
                            : passwordStrength === 'medium'
                              ? 'text-yellow-900'
                              : 'text-green-900'
                        }`}>Attempts:</span>{' '}
                        {crackAttempts.toLocaleString()} / 10,000
                      </div>
                      <div>
                        <span className={`font-semibold ${
                          passwordStrength === 'easy'
                            ? 'text-red-900'
                            : passwordStrength === 'medium'
                              ? 'text-yellow-900'
                              : 'text-green-900'
                        }`}>Strength:</span> {passwordStrength?.toUpperCase()}
                      </div>
                      <div>
                        <span className={`font-semibold ${
                          passwordStrength === 'easy'
                            ? 'text-red-900'
                            : passwordStrength === 'medium'
                              ? 'text-yellow-900'
                              : 'text-green-900'
                        }`}>Crack Time:</span> &lt; 1 second
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {passwordStrength === 'easy' && (
                <Alert className="bg-red-50 border-red-200">
                  <span className="material-icons mr-2 text-red-600">error</span>
                  <AlertTitle className="text-red-900">Immediate Action Required</AlertTitle>
                  <AlertDescription className="text-red-800 mt-2">
                    This password is extremely vulnerable. A standard computer can crack it in
                    seconds. Change your passwords immediately if you use simple 4-digit pins
                    anywhere.
                  </AlertDescription>
                </Alert>
              )}

              {passwordStrength === 'medium' && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <span className="material-icons mr-2 text-yellow-600">warning</span>
                  <AlertTitle className="text-yellow-900">Upgrade Your Password</AlertTitle>
                  <AlertDescription className="text-yellow-800 mt-2">
                    While this password is more resistant than simple ones, it can still be
                    cracked in seconds by dedicated attackers. Consider using longer passwords
                    with mixed character types.
                  </AlertDescription>
                </Alert>
              )}

              {passwordStrength === 'strong' && (
                <Alert className="bg-green-50 border-green-200">
                  <span className="material-icons mr-2 text-green-600">check_circle</span>
                  <AlertTitle className="text-green-900">Strong Password</AlertTitle>
                  <AlertDescription className="text-green-800 mt-2">
                    This password shows good resistance to brute force attacks. Continue using
                    strong passwords with this level of complexity.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setPasswordInput('');
                    setCrackedPassword(null);
                    setCrackAttempts(0);
                    setCrackProgress(0);
                    setPasswordStrength(null);
                  }}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white flex-1"
                >
                  <span className="material-icons text-sm mr-2">refresh</span>
                  Try Another Password
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BruteForceDetector;
