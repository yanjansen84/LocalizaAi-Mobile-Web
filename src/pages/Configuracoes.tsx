import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Settings, MessageCircle, Shield, Languages, HelpCircle, 
  Users, Star, Moon, Sun, LogOut, ChevronRight, User, 
  Bell, CreditCard, Ticket, Edit2, Calendar
} from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast'; // Import toast

interface UserProfile {
  full_name: string;
  avatar_url: string | null;
  email: string;
  bio?: string;
}

function Configuracoes() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('full_name, avatar_url, email, bio')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast.success('Você saiu com sucesso');
    } catch (error) {
      console.error('Erro ao sair:', error);
      toast.error('Erro ao sair da conta');
    }
  };

  const settingsOptions = [
    {
      title: 'Conta',
      items: [
        {
          icon: User,
          label: 'Editar Perfil',
          action: () => navigate('/configuracoes/perfil')
        },
        {
          icon: Calendar,
          label: 'Gerenciar Eventos',
          action: () => navigate('/gerenciar-eventos')
        },
        {
          icon: Bell,
          label: 'Notificações',
          action: () => navigate('/configuracoes/notificacoes')
        },
        {
          icon: CreditCard,
          label: 'Formas de Pagamento',
          action: () => navigate('/configuracoes/pagamento')
        }
      ]
    },
    {
      title: 'Preferências',
      items: [
        {
          icon: Languages,
          label: 'Idioma',
          value: 'Português (BR)',
          action: () => console.log('Mudar Idioma')
        },
        {
          icon: theme === 'dark' ? Sun : Moon,
          label: 'Modo Escuro',
          isToggle: true,
          value: theme === 'dark',
          action: toggleTheme
        }
      ]
    },
    {
      title: 'Suporte',
      items: [
        {
          icon: Ticket,
          label: 'Problemas com Ingressos',
          action: () => console.log('Problemas com Ingressos')
        },
        {
          icon: HelpCircle,
          label: 'Central de Ajuda',
          action: () => console.log('Central de Ajuda')
        },
        {
          icon: Shield,
          label: 'Segurança',
          action: () => console.log('Segurança')
        }
      ]
    },
    {
      title: 'Social',
      items: [
        {
          icon: Users,
          label: 'Convidar Amigos',
          action: () => console.log('Convidar Amigos')
        },
        {
          icon: Star,
          label: 'Avalie-nos',
          action: () => console.log('Avalie-nos')
        }
      ]
    },
    {
      title: '',
      items: [
        {
          icon: LogOut,
          label: 'Sair',
          isDanger: true,
          action: handleSignOut
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="h-screen flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="p-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Configurações
            </h1>
            
            {/* Profile Preview */}
            <Link 
              to="/configuracoes/perfil"
              className="block mb-6"
            >
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl p-4 active:bg-gray-200 dark:active:bg-gray-700">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {loading ? (
                      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    ) : profile && profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Perfil"
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=6366f1&color=fff`;
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                    <div className="absolute -right-1 -bottom-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <Edit2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    {loading ? (
                      <>
                        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </>
                    ) : (
                      <>
                        <h2 className="font-semibold text-gray-900 dark:text-white">
                          {profile?.full_name}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {profile?.email}
                        </p>
                      </>
                    )}
                    <p className="text-xs text-purple-600 mt-2">
                      Toque para editar seu perfil
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>

            {/* Settings Options */}
            <div className="space-y-6">
              {settingsOptions.map((section, index) => (
                <div key={index}>
                  {section.title && (
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 px-4">
                      {section.title}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {section.items.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={option.action}
                        className={`w-full p-4 ${
                          option.isDanger 
                            ? 'bg-red-50 dark:bg-red-900/20' 
                            : 'bg-gray-100 dark:bg-gray-800'
                        } rounded-xl flex items-center justify-between transition-colors active:bg-gray-200 dark:active:bg-gray-700`}
                      >
                        <div className="flex items-center gap-3">
                          <option.icon className={`w-5 h-5 ${
                            option.isDanger 
                              ? 'text-red-600' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                          <span className={`${
                            option.isDanger 
                              ? 'text-red-600' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {option.label}
                          </span>
                        </div>
                        {option.isToggle ? (
                          <div className={`w-12 h-6 rounded-full p-1 transition-colors ${
                            option.value ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}>
                            <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                              option.value ? 'translate-x-6' : 'translate-x-0'
                            }`} />
                          </div>
                        ) : option.value ? (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {option.value}
                          </span>
                        ) : !option.isDanger && (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botão de Sair */}
        <div className="p-4">
          <button
            onClick={handleSignOut}
            className="w-full p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center gap-3 
                     transition-colors active:bg-red-100 dark:active:bg-red-900/30"
          >
            <LogOut className="w-5 h-5 text-red-600" />
            <span className="text-red-600">Sair da Conta</span>
          </button>
        </div>

        {/* Navbar */}
        <Navbar />
      </div>
    </div>
  );
}

export default Configuracoes;