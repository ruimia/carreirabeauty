export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-rose-600">Política de Privacidade</h1>
          <p className="text-sm text-gray-400 mt-1">Última atualização: julho de 2025</p>
        </div>

        <Section title="1. Quem somos">
          <p>O CarreiraBeauty é uma plataforma de conexão entre profissionais e estabelecimentos do setor de beleza, operada por Carreira Beauty Portal da Beleza Ltda (CNPJ 18.530.947/0001-70), com sede no Brasil.</p>
        </Section>

        <Section title="2. Dados que coletamos">
          <p>Coletamos os dados que você fornece ao se cadastrar e usar a plataforma:</p>
          <ul>
            <li><strong>Profissionais:</strong> nome, e-mail, telefone, cidade, função, experiência, foto e informações de currículo.</li>
            <li><strong>Empresas:</strong> razão social, CNPJ, nome do estabelecimento, endereço, telefone, e-mail do responsável e logo.</li>
            <li><strong>Uso:</strong> vagas criadas, candidaturas realizadas e acessos à plataforma.</li>
          </ul>
        </Section>

        <Section title="3. Como usamos seus dados">
          <ul>
            <li>Exibir seu perfil público (profissionais) ou suas vagas (empresas).</li>
            <li>Conectar profissionais com empresas por meio de candidaturas.</li>
            <li>Enviar e-mails transacionais relacionados ao seu uso da plataforma.</li>
            <li>Melhorar nossos serviços e prevenir fraudes.</li>
          </ul>
        </Section>

        <Section title="4. Compartilhamento de dados">
          <p>Não vendemos seus dados. Compartilhamos apenas com prestadores de serviço necessários para operar a plataforma (autenticação, hospedagem, envio de e-mail). Quando uma empresa visualiza sua candidatura, ela tem acesso ao seu perfil público — incluindo nome, função, cidade e telefone.</p>
        </Section>

        <Section title="5. Armazenamento e segurança">
          <p>Seus dados são armazenados na infraestrutura da Supabase (PostgreSQL) com criptografia em trânsito e em repouso. Utilizamos autenticação segura via link mágico ou Google OAuth.</p>
        </Section>

        <Section title="6. Seus direitos (LGPD)">
          <p>De acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:</p>
          <ul>
            <li>Acessar, corrigir ou excluir seus dados.</li>
            <li>Revogar consentimento a qualquer momento.</li>
            <li>Solicitar a portabilidade dos seus dados.</li>
          </ul>
          <p>Para exercer seus direitos, entre em contato pelo e-mail <a href="mailto:contato@carreirabeauty.com" className="text-rose-500 hover:underline">contato@carreirabeauty.com</a>.</p>
        </Section>

        <Section title="7. Cookies">
          <p>Utilizamos cookies exclusivamente para manter sua sessão ativa na plataforma. Não utilizamos cookies de rastreamento ou publicidade.</p>
        </Section>

        <Section title="8. Alterações nesta política">
          <p>Podemos atualizar esta política periodicamente. Em caso de mudanças relevantes, notificaremos por e-mail. O uso continuado da plataforma após a notificação implica aceite das novas condições.</p>
        </Section>

        <Section title="9. Contato">
          <p>Dúvidas sobre privacidade: <a href="mailto:contato@carreirabeauty.com" className="text-rose-500 hover:underline">contato@carreirabeauty.com</a></p>
        </Section>

        <p className="text-xs text-gray-400 text-center pt-4">© {new Date().getFullYear()} CarreiraBeauty</p>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl p-6 space-y-3 shadow-sm">
      <h2 className="font-semibold text-gray-800">{title}</h2>
      <div className="text-sm text-gray-600 space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
    </section>
  );
}
