import Image from "next/image";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block lg:w-[60%] relative bg-zinc-900 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop"
          alt="Estádio de Futebol"
          fill
          className="object-cover opacity-60 grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12">
          <h1 className="text-5xl font-bold text-white tracking-tight leading-tight">
            LogiFut <br />
            <span className="text-zinc-400 text-3xl font-medium italic">Gestão de Clubes Elevada.</span>
          </h1>
        </div>
      </div>

      <div className="w-full lg:w-[40%] flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Bem-vindo ao LogiFut</h2>
            <p className="text-sm text-muted-foreground">Acesse sua conta para gerenciar seu clube</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
