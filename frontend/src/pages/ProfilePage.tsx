import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ImageCropper } from '../components/ui/ImageCropper';
import {
  User as UserIcon,
  Save,
  Camera,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Hash,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { useToast } from '../context/ToastContext';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  // Form state
  const [paInput, setPaInput] = useState('');
  const [nipInput, setNipInput] = useState('');
  const [noHP, setNoHP] = useState('');
  const [alamat, setAlamat] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper state
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPhotoSuccessModal, setShowPhotoSuccessModal] = useState(false);

  // Feedback
  const [photoError, setPhotoError] = useState('');

  useEffect(() => {
    if (user) {
      setPaInput(user.dosenPA || '');
      setNipInput(user.dosenPANip || '');
      setNoHP(user.noHP || '');
      setAlamat(user.alamat || '');
      setPhotoPreview(user.photoUrl || null);
    }
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Validate size (<2MB)
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Ukuran foto maksimal 2MB.');
      return;
    }

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Format harus JPG, PNG, atau WebP.');
      return;
    }

    // Open cropper
    const objectUrl = URL.createObjectURL(file);
    setRawImageUrl(objectUrl);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedUrl: string) => {
    try {
      const response = await fetch(croppedUrl);
      const blob = await response.blob();
      const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      const apiResponse = await api.uploadAvatar(file);
      if (apiResponse.success && apiResponse.data) {
        setPhotoPreview(apiResponse.data.photoUrl || null);
        updateUser({ photoUrl: apiResponse.data.photoUrl });
        setShowPhotoSuccessModal(true);
      }
    } catch (err) {
      showToast('Gagal mengunggah foto profil', 'error');
      console.error(err);
    } finally {
      setShowCropper(false);
      if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
      setRawImageUrl(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
    setRawImageUrl(null);
  };

  const handleSave = () => {
    if (user?.role?.toUpperCase() === 'STUDENT') {
      if (!paInput.trim() || !nipInput.trim()) {
        showToast('Nama Dosen PA dan NIP wajib diisi.', 'error');
        return;
      }
    }
    updateUser({
      dosenPA: paInput.trim(),
      dosenPANip: nipInput.trim(),
      noHP: noHP.trim(),
      alamat: alamat.trim(),
    });
    showToast('Profil berhasil diperbarui!', 'success');
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Profil Saya
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Kelola informasi akun dan data akademik Anda.
          </p>
        </div>

        {/* Photo + Identity Card */}
        <div className="bg-white dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
            {/* Photo Upload */}
            <div className="relative group shrink-0">
              <div className="h-28 w-28 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Foto profil" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon size={48} className="text-zinc-400" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg hover:bg-orange-700 transition-colors border-2 border-white dark:border-zinc-950"
                title="Ganti foto"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            {/* Identity Info */}
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{user?.name}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1"><Mail size={13} /> {user?.email}</span>
                {user?.userId && <span className="inline-flex items-center gap-1"><Hash size={13} /> {user.userId}</span>}
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">
                  {user?.role}
                </span>
                {user?.prodi && (
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                    {user.prodi}
                  </span>
                )}
                {user?.angkatan && (
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    Angkatan {user.angkatan}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Photo Error */}
          {photoError && (
            <div className="mx-6 mb-4 p-3 rounded bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" /> {photoError}
            </div>
          )}
          <div className="mx-6 mb-4 text-[11px] text-zinc-400 dark:text-zinc-500">
            Foto profil: format JPG/PNG/WebP, maksimal 2MB. Anda dapat mengatur bagian foto yang diinginkan setelah memilih file.
          </div>
        </div>

        {/* Image Cropper Modal */}
        {showCropper && rawImageUrl && (
          <ImageCropper
            imageUrl={rawImageUrl}
            onCrop={handleCropComplete}
            onCancel={handleCropCancel}
            outputSize={400}
          />
        )}

        {/* Info Kontak */}
        <div className="bg-white dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
              <Phone size={14} /> Informasi Kontak
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">No. Telepon / WhatsApp</label>
              <input
                type="text"
                value={noHP}
                onChange={(e) => setNoHP(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Alamat</label>
              <textarea
                rows={2}
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Alamat tempat tinggal saat ini..."
                className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Informasi Akademik (read-only) */}
        {user?.role?.toUpperCase() === 'STUDENT' && (
          <div className="bg-white dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <GraduationCap size={14} /> Informasi Akademik
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
                  <span className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5">NIM</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><Hash size={14} className="text-zinc-400" />{user?.userId || '-'}</span>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
                  <span className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5">Program Studi</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><BookOpen size={14} className="text-zinc-400" />{user?.prodi || '-'}</span>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
                  <span className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5">Angkatan</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><Calendar size={14} className="text-zinc-400" />{user?.angkatan || '-'}</span>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
                  <span className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5">Jurusan</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><GraduationCap size={14} className="text-zinc-400" />{user?.department || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dosen PA Section */}
        {user?.role?.toUpperCase() === 'STUDENT' && (
          <div className="bg-white dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <UserIcon size={14} /> Dosen Penasehat Akademik
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Nama Dosen PA <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={paInput}
                  onChange={(e) => setPaInput(e.target.value)}
                  placeholder="Masukkan nama lengkap Dosen PA..."
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  NIP Dosen PA <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nipInput}
                  onChange={(e) => setNipInput(e.target.value)}
                  placeholder="Masukkan NIP Dosen PA..."
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                <AlertCircle size={12} className="text-rose-400" />
                Wajib diisi agar dapat membuat pengajuan judul skripsi.
              </p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowSaveModal(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-semibold transition-colors shadow-sm"
          >
            <Save size={16} /> Simpan Profil
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showSaveModal}
        title="Simpan Perubahan"
        message="Apakah Anda yakin ingin menyimpan perubahan pada profil Anda?"
        confirmText="Ya, Simpan"
        cancelText="Batal"
        type="info"
        onConfirm={handleSave}
        onCancel={() => setShowSaveModal(false)}
      />
      <ConfirmationModal
        isOpen={showPhotoSuccessModal}
        title="Berhasil"
        message="Foto profil Anda berhasil diperbarui."
        confirmText="OK"
        type="success"
        hideCancel={true}
        onConfirm={() => setShowPhotoSuccessModal(false)}
        onCancel={() => setShowPhotoSuccessModal(false)}
      />
    </DashboardLayout>
  );
};
