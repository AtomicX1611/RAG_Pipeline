import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import GoogleSignIn from '../components/auth/GoogleSignIn';
import { APP_NAME, APP_DESCRIPTION } from '../utils/constants';


export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const handleSignIn = async (credential) => {
    await login(credential);
    navigate('/chat');
  };

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="glass rounded-3xl p-8 shadow-lg space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-lg animate-float">
              <span className="text-3xl text-white font-bold">N</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">{APP_NAME}</h1>
              <p className="text-[var(--color-text-secondary)] text-sm mt-2 leading-relaxed max-w-xs mx-auto">
                {APP_DESCRIPTION}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { icon: '', text: 'Upload PDFs & text files' },
              { icon: '', text: 'Choose intelligent chunking strategies' },
              { icon: '', text: 'Get AI-powered answers instantly' },
            ].map((feature) => (
              <div
                key={feature.text}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl
                           bg-[var(--color-bg-primary)]/50"
              >
                <span className="text-lg">{feature.icon}</span>
                <p className="text-sm text-[var(--color-text-secondary)]">{feature.text}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <GoogleSignIn onSignIn={handleSignIn} loading={loading} />
            <p className="text-xs text-center text-[var(--color-text-tertiary)]">
              By continuing, you agree to our Terms of Service
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--color-text-tertiary)] mt-6">
          Powered by RAG • LangChain • ChromaDB • GPT-4o
        </p>
      </div>
    </div>
  );
}
