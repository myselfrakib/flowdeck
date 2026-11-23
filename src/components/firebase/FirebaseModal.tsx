import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Flame, 
  ShieldCheck, 
  Database, 
  HardDrive, 
  CloudUpload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  LogIn, 
  UserPlus, 
  LogOut, 
  ExternalLink,
  Copy,
  Activity,
  FileCheck
} from 'lucide-react';
import { 
  firebaseSignIn, 
  firebaseSignUp, 
  firebaseSignInWithGoogle, 
  firebaseSignOut 
} from '../../services/firebaseAuth';
import { 
  seedInitialDataToFirebase, 
  COLLECTIONS 
} from '../../services/firebaseDb';
import { uploadFileToStorage } from '../../services/firebaseStorage';
import { firebaseConfig } from '../../lib/firebase';

export const FirebaseModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    firebaseUser, 
    addToast,
    projects,
    clients,
    tasks,
    messages,
    shootEvents,
    editVersions,
    activityLogs,
    selectedProjectId,
    uploadSimulatedAsset
  } = useApp();

  const [activeTab, setActiveTab] = useState<'auth' | 'database' | 'storage' | 'config'>('auth');
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Database Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessCount, setSyncSuccessCount] = useState<number | null>(null);

  // Storage Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<'01_Brief' | '02_Raw_Footage' | '03_Audio_Stems' | '07_Client_Screeners' | '08_Final_Delivery'>('07_Client_Screeners');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedResult, setUploadedResult] = useState<{ url: string; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (authMode === 'signin') {
        await firebaseSignIn(email, password);
        addToast('Firebase Auth', 'Successfully signed in with Firebase.', 'success');
      } else {
        await firebaseSignUp(email, password, displayName);
        addToast('Firebase Auth', 'Account created successfully in Firebase.', 'success');
      }
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
      addToast('Auth Error', err.message || 'Authentication failed', 'danger');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await firebaseSignInWithGoogle();
      addToast('Firebase Auth', 'Signed in with Google successfully.', 'success');
    } catch (err: any) {
      setAuthError(err.message || 'Google sign-in failed');
      addToast('Google Sign In', err.message, 'danger');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut();
      addToast('Firebase Auth', 'Signed out from Firebase.', 'info');
    } catch (err: any) {
      addToast('Error', err.message, 'danger');
    }
  };

  const handleSyncToFirestore = async () => {
    setIsSyncing(true);
    const flatMessages = Object.values(messages).flat();
    const result = await seedInitialDataToFirebase({
      projects,
      clients,
      tasks,
      messages: flatMessages,
      shootEvents,
      editVersions,
      activityLogs
    });

    setIsSyncing(false);
    if (result.success) {
      setSyncSuccessCount(result.count);
      addToast('Cloud Firestore', `Synced ${result.count} records to project rakib-18024.`, 'success');
    } else {
      addToast('Firestore Sync', result.error || 'Sync encountered an error', 'danger');
    }
  };

  const handleStorageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const res = await uploadFileToStorage(
        uploadFile, 
        uploadCategory, 
        uploadFile.name, 
        (progress) => setUploadProgress(progress)
      );

      setUploadedResult(res);
      addToast('Cloud Storage', `Uploaded ${res.name} to rakib-18024.firebasestorage.app`, 'success');

      // Also register into active project assets if project is selected
      if (selectedProjectId) {
        uploadSimulatedAsset(
          selectedProjectId,
          uploadCategory as any,
          res.name,
          res.url,
          `${(res.size / (1024 * 1024)).toFixed(2)} MB`
        );
      }
      setUploadFile(null);
    } catch (err: any) {
      addToast('Storage Error', err.message || 'File upload failed', 'danger');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-blue-500/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Firebase Cloud Services
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold border border-orange-200">
                  rakib-18024
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Auth • Cloud Firestore • Realtime DB • Storage • Analytics
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/50 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('auth')}
            className={`px-3.5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'auth'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authentication</span>
            {firebaseUser && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-3.5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'database'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Cloud Firestore & RTDB</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`px-3.5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'storage'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Cloud Storage</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-3.5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'config'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Project Config</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: AUTHENTICATION */}
          {activeTab === 'auth' && (
            <div className="space-y-5">
              
              {/* If signed in with Firebase */}
              {firebaseUser ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        {firebaseUser.displayName?.[0] || firebaseUser.email?.[0] || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-900">
                            {firebaseUser.displayName || 'Firebase User'}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800 font-mono">
                            Authenticated
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700">{firebaseUser.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleSignOut}
                      className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                  <div className="text-[11px] font-mono text-emerald-800/80 bg-white/60 p-2.5 rounded-xl border border-emerald-200/60 break-all">
                    UID: {firebaseUser.uid}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-800">
                      Connect your account to Firebase project <span className="text-orange-600 font-mono">rakib-18024</span>:
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Sign in using Email & Password or Google Auth. You can also continue using StudioFlow Persona mode.
                    </p>
                  </div>

                  {authError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Auth Notice:</span> {authError}
                      </div>
                    </div>
                  )}

                  {/* Google Sign In Button */}
                  <button
                    onClick={handleGoogleAuth}
                    disabled={authLoading}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="flex items-center gap-3 my-2 text-xs text-slate-400">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span>or email</span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  {/* Email & Password Form */}
                  <form onSubmit={handleEmailAuth} className="space-y-3">
                    {authMode === 'signup' && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g. Marcus Vance"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@agency.com"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        {authMode === 'signin' ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
                      </button>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        {authLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : authMode === 'signin' ? (
                          <LogIn className="w-3.5 h-3.5" />
                        ) : (
                          <UserPlus className="w-3.5 h-3.5" />
                        )}
                        <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: CLOUD FIRESTORE & RTDB */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-orange-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Cloud Firestore & Realtime Database
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Database URL: https://rakib-18024-default-rtdb.firebaseio.com
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    Live
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Projects</span>
                    <p className="text-sm font-bold text-slate-800">{projects.length}</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Clients</span>
                    <p className="text-sm font-bold text-slate-800">{clients.length}</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Tasks</span>
                    <p className="text-sm font-bold text-slate-800">{tasks.length}</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Shoots</span>
                    <p className="text-sm font-bold text-slate-800">{shootEvents.length}</p>
                  </div>
                </div>
              </div>

              {/* Seed / Sync Action Button */}
              <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-3">
                <div className="flex items-start gap-2.5">
                  <CloudUpload className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-orange-950">
                      Sync StudioFlow Blueprint to Cloud Firestore
                    </h5>
                    <p className="text-[11px] text-orange-800 mt-0.5 leading-relaxed">
                      Writes all current projects, clients, tasks, shoot schedules, video review cuts, and message rooms into your Firebase project collections (<span className="font-mono">{COLLECTIONS.PROJECTS}</span>, <span className="font-mono">{COLLECTIONS.CLIENTS}</span>, etc.).
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {syncSuccessCount !== null ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{syncSuccessCount} documents synced!</span>
                    </div>
                  ) : (
                    <div />
                  )}

                  <button
                    onClick={handleSyncToFirestore}
                    disabled={isSyncing}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>{isSyncing ? 'Syncing to Firestore...' : 'Sync Data to Firestore'}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CLOUD STORAGE */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Firebase Cloud Storage
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        gs://rakib-18024.firebasestorage.app
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
                    Bucket Ready
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Upload raw camera files, ProRes screener cuts, audio stems, and project briefs directly into Firebase Cloud Storage.
                </p>
              </div>

              {/* Upload Form */}
              <form onSubmit={handleStorageUpload} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Direct Bucket Upload
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Taxonomy Folder
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                    >
                      <option value="01_Brief">01_Brief</option>
                      <option value="02_Raw_Footage">02_Raw_Footage</option>
                      <option value="03_Audio_Stems">03_Audio_Stems</option>
                      <option value="07_Client_Screeners">07_Client_Screeners</option>
                      <option value="08_Final_Delivery">08_Final_Delivery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Select Local File
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-slate-600"
                    />
                  </div>
                </div>

                {/* Progress bar */}
                {uploadProgress !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-blue-700">
                      <span>Uploading to Firebase Storage...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-200 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Success Result */}
                {uploadedResult && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>Upload Successful</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 break-all">{uploadedResult.name}</p>
                    <a
                      href={uploadedResult.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline"
                    >
                      <span>Open Download URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={!uploadFile || isUploading}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    {isUploading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CloudUpload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploading ? 'Uploading...' : 'Upload to Cloud Storage'}</span>
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 4: PROJECT CONFIG & CREDENTIALS */}
          {activeTab === 'config' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Active Web App Configuration
                </h4>
                <div className="font-mono text-[11px] bg-slate-900 text-slate-200 p-3.5 rounded-xl space-y-1 overflow-x-auto">
                  <div>projectId: <span className="text-sky-300">"{firebaseConfig.projectId}"</span></div>
                  <div>authDomain: <span className="text-emerald-300">"{firebaseConfig.authDomain}"</span></div>
                  <div>databaseURL: <span className="text-amber-300">"{firebaseConfig.databaseURL}"</span></div>
                  <div>storageBucket: <span className="text-purple-300">"{firebaseConfig.storageBucket}"</span></div>
                  <div>messagingSenderId: <span className="text-slate-400">"{firebaseConfig.messagingSenderId}"</span></div>
                  <div>appId: <span className="text-slate-400">"{firebaseConfig.appId}"</span></div>
                  <div>measurementId: <span className="text-rose-300">"{firebaseConfig.measurementId}"</span></div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center justify-between">
                <span>Firebase Analytics is initialized and reporting for project {firebaseConfig.projectId}.</span>
                <span className="text-[10px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded">Active</span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-600">
              Firebase Project: <strong className="text-slate-900">rakib-18024</strong>
            </span>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

