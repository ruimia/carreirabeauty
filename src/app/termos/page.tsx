export const metadata = { title: "Termos de uso" };

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-rose-600">Termos de Serviço</h1>
          <p className="text-sm text-gray-400 mt-1">Última atualização: julho de 2025</p>
        </div>

        <Section title="1. Aceitação dos termos">
          <p>Ao criar uma conta e usar o CarreiraBeauty, você concorda com estes Termos de Serviço. Se não concordar, não utilize a plataforma.</p>
        </Section>

        <Section title="2. O que é o CarreiraBeauty">
          <p>O CarreiraBeauty é uma plataforma online que conecta profissionais do setor de beleza (cabeleireiros, manicures, esteticistas, entre outros) com estabelecimentos que oferecem vagas de trabalho (salões, clínicas, barbearias, esmalterias etc.).</p>
          <p>Somos um intermediário: não somos empregadores, não gerenciamos contratos de trabalho e não garantimos a contratação de nenhum profissional.</p>
        </Section>

        <Section title="3. Cadastro e conta">
          <ul>
            <li>Você deve fornecer informações verdadeiras e atualizadas ao se cadastrar.</li>
            <li>Cada pessoa ou empresa pode ter apenas uma conta ativa.</li>
            <li>Você é responsável pela segurança do acesso à sua conta.</li>
            <li>Reservamo-nos o direito de suspender ou excluir contas com informações falsas ou que violem estes termos.</li>
          </ul>
        </Section>

        <Section title="4. Profissionais">
          <ul>
            <li>Seu perfil público fica visível para empresas cadastradas na plataforma.</li>
            <li>Você pode se candidatar a vagas com um clique. Ao se candidatar, autoriza que a empresa visualize seu perfil completo, incluindo telefone.</li>
            <li>O uso é gratuito para profissionais. Recursos extras (PRO) podem ser adquiridos por pacote pré-pago, sem cobrança recorrente — ver seção 6.</li>
          </ul>
        </Section>

        <Section title="5. Empresas">
          <ul>
            <li>Empresas podem publicar vagas e visualizar candidatos durante o período de trial (7 dias gratuitos por CNPJ).</li>
            <li>Após o trial, é necessária uma assinatura ativa para publicar e gerenciar vagas.</li>
            <li>As vagas devem ser reais, relacionadas ao setor de beleza e com informações precisas.</li>
            <li>É proibido usar a plataforma para captar dados de profissionais para fins não relacionados à contratação.</li>
          </ul>
        </Section>

        <Section title="6. Pagamentos e cancelamento">
          <ul>
            <li>Todos os pagamentos são processados via Mercado Pago.</li>
            <li><strong>Empresas:</strong> a assinatura é recorrente e renovada automaticamente após o trial. Você pode cancelar a qualquer momento pelo painel da conta; o acesso continua até o fim do período já pago.</li>
            <li><strong>Profissionais (PRO):</strong> o acesso é vendido em pacotes pré-pagos (ex: 30, 90 ou 365 dias), com pagamento único e <strong>sem renovação automática</strong>. Não há o que cancelar — o benefício simplesmente expira na data contratada, e você decide se compra de novo.</li>
            <li>Não realizamos reembolsos de períodos já pagos, exceto em casos previstos em lei.</li>
          </ul>
        </Section>

        <Section title="7. Conteúdo proibido">
          <p>É proibido publicar na plataforma:</p>
          <ul>
            <li>Vagas ou perfis falsos ou enganosos.</li>
            <li>Conteúdo ofensivo, discriminatório ou ilegal.</li>
            <li>Informações de contato de terceiros sem autorização.</li>
            <li>Qualquer conteúdo que viole direitos de terceiros.</li>
          </ul>
        </Section>

        <Section title="8. Limitação de responsabilidade">
          <p>O CarreiraBeauty não se responsabiliza por:</p>
          <ul>
            <li>A qualidade ou veracidade das informações postadas por usuários.</li>
            <li>O resultado de processos de seleção entre empresas e profissionais.</li>
            <li>Acordos, contratos ou relações de trabalho estabelecidos fora da plataforma.</li>
          </ul>
        </Section>

        <Section title="9. Alterações nos termos">
          <p>Podemos atualizar estes termos a qualquer momento. Notificaremos por e-mail em caso de mudanças relevantes. O uso continuado após a notificação implica aceite.</p>
        </Section>

        <Section title="10. Lei aplicável">
          <p>Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de São Paulo/SP para dirimir eventuais conflitos.</p>
        </Section>

        <Section title="11. Contato">
          <p>Dúvidas sobre estes termos: <a href="mailto:contato@carreirabeauty.com" className="text-rose-500 hover:underline">contato@carreirabeauty.com</a></p>
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
