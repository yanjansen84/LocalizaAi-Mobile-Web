import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Loader } from 'lucide-react';
import Login from './pages/Login';
import EsqueceuSenha from './pages/EsqueceuSenha';
import Cadastro from './pages/Cadastro';
import Eventos from './pages/Eventos';
import Feed from './pages/Feed';
import Mapa from './pages/Mapa';
import Notificacoes from './pages/Notificacoes';
import Destaques from './pages/Destaques';
import EventosPopulares from './pages/EventosPopulares';
import Perfil from './pages/Perfil';
import Configuracoes from './pages/Configuracoes';
import EditarPerfil from './pages/EditarPerfil';
import ConfiguracoesNotificacoes from './pages/ConfiguracoesNotificacoes';
import FormasPagamento from './pages/FormasPagamento';
import DetalhesEvento from './pages/DetalhesEvento';
import CriarEvento from './pages/CriarEvento';
import EditarEvento from './pages/EditarEvento';
import EscolhaIngresso from './pages/CompraIngresso/EscolhaIngresso';
import DadosComprador from './pages/CompraIngresso/DadosComprador';
import Pagamento from './pages/CompraIngresso/Pagamento';
import CadastroCartao from './pages/CompraIngresso/CadastroCartao';
import Resumo from './pages/CompraIngresso/Resumo';
import Status from './pages/CompraIngresso/Status';
import Ingressos from './pages/Ingressos';
import CancelarReserva from './pages/CompraIngresso/CancelarReserva';
import Avaliacao from './pages/CompraIngresso/Avaliacao';
import Ingresso from './pages/CompraIngresso/Ingresso';
import GerenciarEventos from './pages/GerenciarEventos';
import ResultadosEvento from './pages/ResultadosEvento';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <Loader className="w-8 h-8 text-purple-600 animate-spin" />
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!user ? <Login /> : <Navigate to="/eventos" replace />} />
        <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Protected Routes */}
        {user ? (
          <>
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/criar-evento" element={<CriarEvento />} />
            <Route path="/editar-evento/:id" element={<EditarEvento />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/notificacoes" element={<Notificacoes />} />
            <Route path="/destaques" element={<Destaques />} />
            <Route path="/eventos-populares" element={<EventosPopulares />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/ingressos" element={<Ingressos />} />
            
            {/* Configurações Routes */}
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/configuracoes/perfil" element={<EditarPerfil />} />
            <Route path="/configuracoes/notificacoes" element={<ConfiguracoesNotificacoes />} />
            <Route path="/configuracoes/pagamento" element={<FormasPagamento />} />
            <Route path="/gerenciar-eventos" element={<GerenciarEventos />} />
            <Route path="/evento/:id/resultados" element={<ResultadosEvento />} />
            
            {/* Evento e Compra Routes */}
            <Route path="/evento/:id" element={<DetalhesEvento />} />
            <Route path="/compra-ingresso/escolha-ingresso" element={<EscolhaIngresso />} />
            <Route path="/compra-ingresso/dados-comprador" element={<DadosComprador />} />
            <Route path="/compra-ingresso/pagamento" element={<Pagamento />} />
            <Route path="/compra-ingresso/cadastro-cartao" element={<CadastroCartao />} />
            <Route path="/compra-ingresso/resumo" element={<Resumo />} />
            <Route path="/compra-ingresso/status" element={<Status />} />
            <Route path="/compra-ingresso/ingresso" element={<Ingresso />} />
            <Route path="/compra-ingresso/cancelar" element={<CancelarReserva />} />
            <Route path="/compra-ingresso/avaliacao" element={<Avaliacao />} />
          </>
        ) : (
          // Redirect to login if not authenticated
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </Suspense>
  );
}

export default App;