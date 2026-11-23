import React, { useState } from 'react';
import { Project, ProjectAsset, AssetCategory } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { 
  Folder, 
  FileText, 
  Film, 
  Image, 
  ExternalLink, 
  Plus, 
  UploadCloud, 
  Lock, 
  Globe, 
  CheckCircle2, 
  HardDrive,
  X
} from 'lucide-react';

interface Props {
  project: Project;
}

export const ProjectAssetsTab: React.FC<Props> = ({ project }) => {
  const { assets, uploadSimulatedAsset, users, currentUser } = useApp();

  const projectAssets = assets.filter(a => a.projectId === project.id);

  const folders: { id: AssetCategory; folderName: string; label: string }[] = [
    { id: 'brief', folderName: '01_Brief', label: '01 Brief & Brand Guidelines' },
    { id: 'inspiration', folderName: '02_Inspiration', label: '02 Moodboards & Visual Inspiration' },
    { id: 'shoot_planning', folderName: '03_Shoot_Planning', label: '03 Shoot Planning & Call Sheets' },
    { id: 'raw_footage', folderName: '04_Raw_Footage', label: '04 Raw Camera Footage (External Vault)' },
    { id: 'photos', folderName: '05_Photos', label: '05 Stills & High-Res Selects' },
    { id: 'editing', folderName: '06_Editing', label: '06 Project Files & Audio Stems' },
    { id: 'review', folderName: '07_Review', label: '07 Review Proxies & Screeners' },
    { id: 'final_delivery', folderName: '08_Final_Delivery', label: '08 Final Master Deliveries (ProRes)' }
  ];

  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('brief');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Form states
  const [assetName, setAssetName] = useState('');
  const [assetUrl, setAssetUrl] = useState('https://drive.google.com/file/d/sample-file/view');
  const [assetSize, setAssetSize] = useState('25.4 MB');

  const filteredAssets = projectAssets.filter(a => a.category === selectedCategory);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) return;
    uploadSimulatedAsset(project.id, selectedCategory, assetName.trim(), assetUrl.trim(), assetSize);
    setIsUploadOpen(false);
    setAssetName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Cloud Storage Strategy Banner */}
      <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold">StudioFlow Cloud Storage Abstraction:</span>
            <p className="text-blue-800 text-[11px] mt-0.5">
              Standardized folder convention (`01_Brief` to `08_Final_Delivery`). Raw 6K footage is linked via Google Drive/Dropbox to prevent costly Firebase storage egress.
            </p>
          </div>
        </div>

        {currentUser.role !== 'client' && (
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Link / Upload Asset</span>
          </button>
        )}
      </div>

      {/* Main Asset Explorer: Left Folders & Right Files */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left: 8 Standard Project Folders */}
        <div className="w-full md:w-72 border-r border-slate-200/80 bg-slate-50/50 p-3 space-y-1 shrink-0">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Standard Directory Tree
          </div>

          {folders.map((folder) => {
            const isSelected = selectedCategory === folder.id;
            const count = projectAssets.filter(a => a.category === folder.id).length;

            return (
              <button
                key={folder.id}
                onClick={() => setSelectedCategory(folder.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                  <span className="truncate">{folder.folderName}</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Files in Selected Folder */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {folders.find(f => f.id === selectedCategory)?.label}
                </h4>
                <p className="text-xs text-slate-400">
                  {filteredAssets.length} asset(s) linked to this stage
                </p>
              </div>

              <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                Provider: Google Drive Enterprise
              </span>
            </div>

            {/* Assets Grid */}
            {filteredAssets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredAssets.map((asset) => {
                  const uploader = users.find(u => u.id === asset.uploadedBy);
                  const isVideo = asset.name.endsWith('.mp4') || asset.category === 'review';
                  const isPdf = asset.name.endsWith('.pdf');

                  return (
                    <div
                      key={asset.id}
                      className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all bg-white space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                          {isVideo ? <Film className="w-5 h-5" /> : isPdf ? <FileText className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          asset.visibility === 'client_visible' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {asset.visibility === 'client_visible' ? 'Client Visible' : 'Internal'}
                        </span>
                      </div>

                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
                          {asset.name}
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Size: {asset.sizeFormatted} • By {uploader?.name.split(' ')[0] || 'Team'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(asset.createdAt).toLocaleDateString()}
                        </span>
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <span>Open File</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400">
                <Folder className="w-12 h-12 mx-auto mb-2 opacity-40 text-blue-400" />
                <p className="text-sm font-semibold text-slate-700">Folder is empty</p>
                <p className="text-xs text-slate-400 mt-1">
                  Upload drafts or paste Google Drive / Dropbox share links.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Upload Asset Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Add Asset to {folders.find(f => f.id === selectedCategory)?.folderName}
                </h4>
              </div>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Asset Name / File Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aura_Radiance_Lookbook_Final.pdf"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Drive / External URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/..."
                  value={assetUrl}
                  onChange={(e) => setAssetUrl(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Reported File Size
                </label>
                <input
                  type="text"
                  value={assetSize}
                  onChange={(e) => setAssetSize(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Save Asset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

