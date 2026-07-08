interface Props {
  step: number;
  total: number;
  title: string;
  children: React.ReactNode;
}

export default function StepShell({ step, total, title, children }: Props) {
  const pct = Math.round((step / total) * 100);

  return (
    <main className="min-h-screen bg-rose-50 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <p className="text-rose-400 text-sm font-medium mb-1">
          Passo {step} de {total}
        </p>
        <div className="w-full bg-rose-100 rounded-full h-1.5 mb-6">
          <div
            className="bg-rose-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{title}</h2>
          {children}
        </div>
      </div>
    </main>
  );
}
