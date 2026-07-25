import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { GraduationCap, Mail, Lock, User, Hash, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';
import { Select } from '../components/ui/select';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [prodi, setProdi] = useState<'PTIK' | 'TEKOM'>('PTIK');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await api.register({
        name,
        email,
        password,
        role: 'STUDENT',
        userId,
        prodi,
        department: 'Teknik Informatika dan Komputer',
      });
      
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Daftar Akun SkripsiHub
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Atau{' '}
          <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-500 transition-colors">
            masuk ke akun yang sudah ada
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-zinc-200 dark:border-zinc-800">
          
          {success ? (
            <div className="rounded-md bg-emerald-50 dark:bg-emerald-500/10 p-4 border border-emerald-200 dark:border-emerald-500/20">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    Pendaftaran Berhasil!
                  </h3>
                  <div className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
                    <p>
                      Akun Anda telah berhasil dibuat dan saat ini sedang menunggu persetujuan dari Admin. Anda akan diarahkan ke halaman login...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleRegister}>
              {error && (
                <div className="rounded-md bg-rose-50 dark:bg-rose-500/10 p-4 border border-rose-200 dark:border-rose-500/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-rose-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-rose-800 dark:text-rose-300">Pendaftaran Gagal</h3>
                      <div className="mt-2 text-sm text-rose-700 dark:text-rose-400">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Nama Lengkap
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-zinc-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent sm:text-sm transition-all"
                    placeholder="Budi Santoso"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  NIM
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-zinc-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={userId}
                    onChange={(e) => setUserId(e.target.value.replace(/\D/g, ''))}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent sm:text-sm transition-all"
                    placeholder="210209500000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Program Studi
                </label>
                <div className="mt-1 relative">
                  <Select
                    value={prodi}
                    onChange={(val) => setProdi(val as 'PTIK' | 'TEKOM')}
                    options={[
                      { value: 'PTIK', label: 'Pendidikan Teknik Informatika dan Komputer (PTIK)' },
                      { value: 'TEKOM', label: 'Teknik Komputer (TEKOM)' }
                    ]}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-zinc-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent sm:text-sm transition-all"
                    placeholder="budi@student.unm.ac.id"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-zinc-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent sm:text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
