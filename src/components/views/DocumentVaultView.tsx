import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { KNOWLEDGE_VAULT_DOCS, KnowledgeDoc } from '../../data/knowledgeVaultData.ts';
import {
  encryptDocument,
  decryptDocument,
  downloadPlaintextFile,
  downloadEncryptedFile,
  EncryptedPayload
} from '../../utils/crypto.ts';
import {
  FileText,
  Search,
  Upload,
  Download,
  Trash2,
  Folder,
  FileCheck2,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Eye,
  X,
  CheckCircle2,
  Copy,
  Filter,
  Plus,
  ArrowRight,
  BookOpen,
  Layers,
  FileCode,
  Tag,
  Clock,
  User,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

type VaultCategory = 'All' | 'SOP' | 'Tax & Compliance' | 'Transition & TOM' | 'Governance & Legal' | 'Audit & Controls' | 'Financial Close';

export const DocumentVaultView: React.FC = () => {
  const { onboardings, toast } = useData();

  // Documents state
  const [docsList, setDocsList] = useState<KnowledgeDoc[]>(KNOWLEDGE_VAULT_DOCS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VaultCategory>('All');
  const [selectedSecurity, setSelectedSecurity] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'vault' | 'decryptStation' | 'auditLog'>('vault');

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDoc | null>(null);

  // Encrypted Download Modal State
  const [encryptModalDoc, setEncryptModalDoc] = useState<KnowledgeDoc | null>(null);
  const [encryptPassphrase, setEncryptPassphrase] = useState('');
  const [encryptConfirmPass, setEncryptConfirmPass] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Decryption Station State
  const [decryptFile, setDecryptFile] = useState<File | null>(null);
  const [decryptJsonInput, setDecryptJsonInput] = useState('');
  const [decryptPassphrase, setDecryptPassphrase] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedResult, setDecryptedResult] = useState<{
    text: string;
    meta: EncryptedPayload['meta'];
  } | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  // New Document Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<KnowledgeDoc['category']>('SOP');
  const [newSecurity, setNewSecurity] = useState<KnowledgeDoc['securityClassification']>('Internal Standard');
  const [newTags, setNewTags] = useState('SOP, Best Practices');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const decryptFileInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered documents
  const filteredDocs = docsList.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSecurity = selectedSecurity === 'All' || doc.securityClassification === selectedSecurity;

    return matchesSearch && matchesCategory && matchesSecurity;
  });

  // Handle standard download
  const handlePlainDownload = (doc: KnowledgeDoc) => {
    const filename = `${doc.code}_${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    downloadPlaintextFile(filename, doc.content);
    toast(`Downloaded ${doc.code} (Plain Markdown)`);
  };

  // Open Encrypt Modal
  const handleOpenEncryptModal = (doc: KnowledgeDoc) => {
    setEncryptModalDoc(doc);
    setEncryptPassphrase('');
    setEncryptConfirmPass('');
  };

  // Execute AES-256-GCM Encryption and Download
  const handleExecuteEncryptDownload = async () => {
    if (!encryptModalDoc) return;
    if (!encryptPassphrase || encryptPassphrase.length < 6) {
      toast('Passphrase must be at least 6 characters long');
      return;
    }
    if (encryptPassphrase !== encryptConfirmPass) {
      toast('Passphrases do not match');
      return;
    }

    try {
      setIsEncrypting(true);
      const payload = await encryptDocument(encryptModalDoc.content, encryptPassphrase, {
        name: encryptModalDoc.title,
        type: encryptModalDoc.type,
        category: encryptModalDoc.category
      });

      const filename = `${encryptModalDoc.code}_${encryptModalDoc.title.replace(/[^a-zA-Z0-9]/g, '_')}.trivium.enc`;
      downloadEncryptedFile(filename, payload);

      toast(`Encrypted & downloaded ${encryptModalDoc.code} with AES-256-GCM`);
      setEncryptModalDoc(null);
      setEncryptPassphrase('');
      setEncryptConfirmPass('');
    } catch (err: any) {
      toast(`Encryption failed: ${err.message}`);
    } finally {
      setIsEncrypting(false);
    }
  };

  // Handle Decryption of uploaded file or pasted payload
  const handleExecuteDecryption = async () => {
    setDecryptError(null);
    setDecryptedResult(null);

    if (!decryptPassphrase) {
      setDecryptError('Please enter the decryption passphrase');
      return;
    }

    let payloadString = decryptJsonInput;

    if (decryptFile) {
      try {
        payloadString = await decryptFile.text();
      } catch (err: any) {
        setDecryptError(`Failed to read file: ${err.message}`);
        return;
      }
    }

    if (!payloadString.trim()) {
      setDecryptError('Please upload an encrypted .trivium.enc file or paste ciphertext');
      return;
    }

    try {
      setIsDecrypting(true);
      const parsedPayload: EncryptedPayload = JSON.parse(payloadString);

      if (parsedPayload.algorithm !== 'AES-256-GCM' || !parsedPayload.ciphertext || !parsedPayload.salt || !parsedPayload.iv) {
        throw new Error('Invalid or unsupported encryption payload format. Expected AES-256-GCM container.');
      }

      const result = await decryptDocument(parsedPayload, decryptPassphrase);
      setDecryptedResult(result);
      toast('Decryption successful! Cryptographic integrity verified.');
    } catch (err: any) {
      setDecryptError(err.message || 'Decryption failed: invalid key or corrupted payload');
    } finally {
      setIsDecrypting(false);
    }
  };

  // Handle local file selection for Decrypt Station
  const handleDecryptFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDecryptFile(file);
      setDecryptJsonInput('');
      setDecryptError(null);
      setDecryptedResult(null);
    }
  };

  // Handle New Document Upload / Creation
  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast('Please enter a title and document content');
      return;
    }

    const newDoc: KnowledgeDoc = {
      id: `DOC-CUSTOM-${Date.now()}`,
      code: `CUST-${String(docsList.length + 1).padStart(2, '0')}`,
      title: newTitle.trim(),
      category: newCategory,
      type: 'MD',
      version: 'v1.0',
      lastUpdated: new Date().toISOString().slice(0, 10),
      author: 'Priya Nair, Lead Delivery Architect',
      securityClassification: newSecurity,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      summary: newSummary.trim() || newContent.slice(0, 140) + '...',
      content: newContent
    };

    setDocsList([newDoc, ...docsList]);
    toast(`Added "${newDoc.title}" to Knowledge Vault`);
    setIsUploadModalOpen(false);
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold border border-indigo-200 dark:border-indigo-800">
              Knowledge Base & SOP Repository
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Client-Side AES-256-GCM Encrypted
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            F&A Document Vault & Encryption Station
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Centralized repository of Trivium Standard Operating Procedures (SOPs), US tax playbooks, 7-phase transition blueprints, RACI governance matrices, and audited workpapers with flexible AES-256 client-side encryption and decryption.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('decryptStation')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'decryptStation'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Decryption Station
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'vault'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Knowledge Vault ({docsList.length})
          </button>

          <button
            onClick={() => setActiveTab('decryptStation')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'decryptStation'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            Decryption Station
          </button>
        </div>

        <div className="text-xs font-mono text-slate-500 hidden sm:block">
          End-to-End Zero-Knowledge Client Security
        </div>
      </div>

      {/* TAB 1: KNOWLEDGE VAULT REPOSITORY */}
      {activeTab === 'vault' && (
        <div className="space-y-4">
          {/* Category Filter Pills & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {(['All', 'SOP', 'Tax & Compliance', 'Transition & TOM', 'Governance & Legal', 'Audit & Controls', 'Financial Close'] as VaultCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search vault SOPs, playbooks, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <select
                value={selectedSecurity}
                onChange={(e) => setSelectedSecurity(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden"
              >
                <option value="All">All Security Levels</option>
                <option value="Internal Standard">Internal Standard</option>
                <option value="Restricted">Restricted</option>
                <option value="Confidential">Confidential</option>
              </select>
            </div>
          </div>

          {/* Document Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {doc.code}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {doc.version}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      doc.securityClassification === 'Restricted'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/50'
                        : doc.securityClassification === 'Confidential'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50'
                    }`}>
                      <Lock className="w-2.5 h-2.5" />
                      {doc.securityClassification}
                    </span>
                  </div>

                  <h3
                    onClick={() => setPreviewDoc(doc)}
                    className="font-bold text-slate-900 dark:text-white text-sm mt-2.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 cursor-pointer"
                  >
                    {doc.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                    {doc.summary}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {doc.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {doc.lastUpdated}
                    </span>
                    <span className="truncate max-w-[140px] text-slate-500">
                      {doc.author.split(',')[0]}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 text-xs">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePlainDownload(doc)}
                      title="Download as standard Markdown"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Plain
                    </button>

                    <button
                      onClick={() => handleOpenEncryptModal(doc)}
                      title="Encrypt with custom passphrase and download"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Encrypt & DL
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DECRYPTION STATION */}
      {activeTab === 'decryptStation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Decryption Controls Form */}
          <div className="lg:col-span-1 space-y-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" />
                Decryption Station
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload an encrypted <code className="text-indigo-600 font-mono">.trivium.enc</code> file or paste the encrypted JSON ciphertext container.
              </p>
            </div>

            {/* File Upload Zone */}
            <div
              onClick={() => decryptFileInputRef.current?.click()}
              className="p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-center cursor-pointer transition-colors space-y-2 bg-slate-50/50 dark:bg-slate-800/20"
            >
              <input
                type="file"
                ref={decryptFileInputRef}
                accept=".enc,.json,.txt,.trivium.enc"
                onChange={handleDecryptFileSelected}
                className="hidden"
              />
              <Lock className="w-6 h-6 text-emerald-600 mx-auto" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {decryptFile ? decryptFile.name : 'Click to select encrypted .trivium.enc file'}
              </div>
              <div className="text-[10px] text-slate-400">
                {decryptFile ? `${(decryptFile.size / 1024).toFixed(1)} KB` : 'Supports AES-256-GCM encrypted artifacts'}
              </div>
            </div>

            {/* Or Paste Raw JSON */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Or Paste Encrypted JSON Container:
              </label>
              <textarea
                rows={4}
                value={decryptJsonInput}
                onChange={(e) => {
                  setDecryptJsonInput(e.target.value);
                  setDecryptFile(null);
                }}
                placeholder='{"version":"1.0","algorithm":"AES-256-GCM","ciphertext":"..."}'
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-hidden"
              />
            </div>

            {/* Passphrase Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Decryption Passphrase</span>
                <span className="text-[10px] text-slate-400 font-normal">PBKDF2 SHA-256 Key</span>
              </label>
              <input
                type="password"
                value={decryptPassphrase}
                onChange={(e) => setDecryptPassphrase(e.target.value)}
                placeholder="Enter secret passphrase..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-hidden"
              />
            </div>

            {decryptError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{decryptError}</div>
              </div>
            )}

            <button
              onClick={handleExecuteDecryption}
              disabled={isDecrypting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDecrypting ? (
                <>Decrypting via WebCrypto...</>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  Decrypt & Verify Integrity
                </>
              )}
            </button>
          </div>

          {/* Decryption Output Area */}
          <div className="lg:col-span-2 space-y-4">
            {decryptedResult ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-300 dark:border-emerald-800 shadow-md p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Decrypted & Authenticated
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {decryptedResult.meta?.category || 'Vault Document'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {decryptedResult.meta?.name || 'Decrypted Document'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(decryptedResult.text);
                        toast('Copied decrypted text to clipboard');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </button>

                    <button
                      onClick={() => {
                        const filename = `${decryptedResult.meta?.name || 'Decrypted_Document'}.md`;
                        downloadPlaintextFile(filename, decryptedResult.text);
                        toast(`Downloaded ${filename}`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Plaintext
                    </button>
                  </div>
                </div>

                {/* Markdown / Text viewer */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 max-h-[500px] overflow-y-auto font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {decryptedResult.text}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Awaiting Encrypted Payload
                </h3>
                <p className="text-xs text-slate-500 max-w-md">
                  Select an encrypted file from your local disk or paste ciphertext and provide the PBKDF2 passphrase to decrypt and inspect the document contents securely.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-lg bg-indigo-600 text-white shadow-2xs">
                  {previewDoc.code}
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                    {previewDoc.title}
                  </h2>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{previewDoc.category}</span>
                    <span>•</span>
                    <span>{previewDoc.version}</span>
                    <span>•</span>
                    <span>{previewDoc.author}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlainDownload(previewDoc)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Plaintext
                </button>

                <button
                  onClick={() => {
                    const doc = previewDoc;
                    setPreviewDoc(null);
                    handleOpenEncryptModal(doc);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Encrypt & Download
                </button>

                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-slate-50/50 dark:bg-slate-950/50 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {previewDoc.content}
            </div>
          </div>
        </div>
      )}

      {/* ENCRYPT AND DOWNLOAD MODAL */}
      {encryptModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    AES-256-GCM Secure Encryption
                  </h3>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {encryptModalDoc.code} • WebCrypto Zero-Knowledge
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEncryptModalDoc(null)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Target Document</div>
                <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{encryptModalDoc.title}</div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Enter Encryption Passphrase (Min. 6 chars)
                </label>
                <input
                  type="password"
                  value={encryptPassphrase}
                  onChange={(e) => setEncryptPassphrase(e.target.value)}
                  placeholder="Set secret passphrase..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Confirm Passphrase
                </label>
                <input
                  type="password"
                  value={encryptConfirmPass}
                  onChange={(e) => setEncryptConfirmPass(e.target.value)}
                  placeholder="Confirm secret passphrase..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div className="text-[11px] text-slate-500 flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/50">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  The derived key uses <b>100,000 rounds of PBKDF2 SHA-256</b> and random 12-byte initialization vectors (IV). The payload can only be decrypted with this exact passphrase.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setEncryptModalDoc(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteEncryptDownload}
                  disabled={isEncrypting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isEncrypting ? 'Encrypting...' : 'Encrypt & Download (.enc)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD / CREATE NEW DOCUMENT MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Add Document to Knowledge Vault
                </h3>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Document Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. SOP: Fixed Asset Capitalization & ASC 842 Lease Schedules"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  >
                    <option value="SOP">SOP</option>
                    <option value="Tax & Compliance">Tax & Compliance</option>
                    <option value="Transition & TOM">Transition & TOM</option>
                    <option value="Governance & Legal">Governance & Legal</option>
                    <option value="Audit & Controls">Audit & Controls</option>
                    <option value="Financial Close">Financial Close</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Security Level</label>
                  <select
                    value={newSecurity}
                    onChange={(e) => setNewSecurity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  >
                    <option value="Internal Standard">Internal Standard</option>
                    <option value="Restricted">Restricted</option>
                    <option value="Confidential">Confidential</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="AP, Close, Controls, Delaware"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Executive Summary</label>
                <input
                  type="text"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Brief synopsis of procedure and target outcomes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Markdown Content</label>
                <textarea
                  rows={6}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="# Procedure Steps&#10;1. Intake&#10;2. Validation..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Publish to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
