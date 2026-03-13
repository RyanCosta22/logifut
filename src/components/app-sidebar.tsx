"use client";

import { useQuery } from "@tanstack/react-query";
import { getClubByIdAction } from "@/actions/club/club";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Calendar,
  Contact,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Plane,
  Settings,
  Shield,
  Trophy,
  Users,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface AppSidebarProps {
  clubId: string;
}

export function AppSidebar({ clubId }: AppSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();

  const { data: result } = useQuery({
    queryKey: ["club", clubId],
    queryFn: () => getClubByIdAction(clubId),
    enabled: !!clubId,
  });

  const club = result?.club;

  const items = [
    {
      title: "Dashboard",
      url: `/dashboard/${clubId}`,
      icon: LayoutDashboard,
    },
    {
      title: "Jogadores",
      url: `/dashboard/${clubId}/jogadores`,
      icon: Contact,
    },
    {
      title: "Partidas",
      url: `/dashboard/${clubId}/partidas`,
      icon: Calendar,
    },
    {
      title: "Formações",
      url: `/dashboard/${clubId}/formacoes`,
      icon: Shield,
    },
    {
      title: "Viagens",
      url: `/dashboard/${clubId}/viagens`,
      icon: Plane,
    },
    {
      title: "Custos",
      url: `/dashboard/${clubId}/custos`,
      icon: DollarSign,
    },
    {
      title: "Competições",
      url: `/dashboard/${clubId}/competicoes`,
      icon: Trophy,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b h-16 flex items-center justify-center">
        {state === "expanded" ? (
          <div className="flex items-center gap-2 w-full px-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
              {club?.name?.substring(0, 1).toUpperCase() || "L"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold truncate">{club?.name || "Carregando..."}</span>
              <span className="text-xs text-muted-foreground truncate">LogiFut Pro</span>
            </div>
          </div>
        ) : (
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
            {club?.name?.substring(0, 1).toUpperCase() || "L"}
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Voltar ao início">
              <Link href="/dashboard">
                <ChevronLeft />
                <span>Trocar Clube</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => signOut({ callbackUrl: "/entrar" })}
              tooltip="Sair"
            >
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
