import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import PiggyAvatar from '@/components/PiggyAvatar';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      if (!name.trim()) { setError('Coloque seu nome, vai!'); setLoading(false); return; }
      const { error } = await signUp(email, password, name);
      if (error) setError(error);
      else setSuccess('Conta criada! Confirme seu e-mail se necessário, depois entre 🐷');
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10"
      style={{ background: 'linear-gradient(160deg, #f0faf5 0%, #e8f5ee 100%)' }}
    >
      {/* Piggy mascot */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="mb-2"
        style={{ filter: 'drop-shadow(0 16px 24px rgba(0,96,63,0.15))' }}
      >
        <PiggyAvatar mood={error ? 'sad' : success ? 'happy' : 'idle'} className="w-28 h-28" />
      </motion.div>

      <h1 className="text-2xl font-bold text-center mb-1" style={{ color: '#1a3a2a' }}>
        Porquinho Carente 🐷
      </h1>
      <p className="text-sm text-center mb-8" style={{ color: '#596060' }}>
        {mode === 'login' ? 'Que saudade das suas moedinhas!' : 'Vamos guardar suas moedinhas juntos!'}
      </p>

      <motion.div
        layout
        className="w-full max-w-sm rounded-3xl p-6"
        style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 20px 60px rgba(0,96,63,0.12)' }}
      >
        {/* Tab switcher */}
        <div className="flex rounded-2xl p-1 mb-6" style={{ background: '#eaefee' }}>
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setSuccess(null); }}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: mode === m ? '#006d49' : 'transparent',
                color: mode === m ? '#e6ffee' : '#596060',
              }}
            >
              {m === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#596060' }}>Nome</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#596060' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Seu nome aqui"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm outline-none transition-all"
                    style={{ background: '#dde4e3', border: 'none', color: '#2d3433' }}
                    onFocus={e => { e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 2px #006d49'; }}
                    onBlur={e => { e.target.style.background = '#dde4e3'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#596060' }}>E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#596060' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm outline-none transition-all"
                style={{ background: '#dde4e3', border: 'none', color: '#2d3433' }}
                onFocus={e => { e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 2px #006d49'; }}
                onBlur={e => { e.target.style.background = '#dde4e3'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#596060' }}>Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#596060' }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="w-full pl-11 pr-12 py-3 rounded-2xl text-sm outline-none transition-all"
                style={{ background: '#dde4e3', border: 'none', color: '#2d3433' }}
                onFocus={e => { e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 2px #006d49'; }}
                onBlur={e => { e.target.style.background = '#dde4e3'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: '#596060' }}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs px-3 py-2 rounded-xl"
                style={{ background: '#fff0f0', color: '#a83836' }}
              >
                🐷 {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs px-3 py-2 rounded-xl"
                style={{ background: '#f0fff7', color: '#006d49' }}
              >
                ✅ {success}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
            style={{
              background: 'linear-gradient(135deg, #006d49, #00a86b)',
              color: '#e6ffee',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</>
            ) : mode === 'login' ? (
              '🐷 Entrar no Cofrinho'
            ) : (
              '🪙 Criar minha conta'
            )}
          </motion.button>
        </form>
      </motion.div>

      <p className="text-xs mt-6 text-center" style={{ color: '#9ab0a8' }}>
        Seus dados ficam seguros e só você pode vê-los 🔐
      </p>
    </div>
  );
}
