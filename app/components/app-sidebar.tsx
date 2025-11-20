import * as React from 'react';
import {
  IconDashboard,
  IconFolder,
  IconHelp,
  IconHome,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
  IconTag,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';

import { NavMain } from '~/components/nav-main';
import { NavSecondary } from '~/components/nav-secondary';
import { NavUser } from '~/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar';

const data = {
  user: {
    name: 'omar',
    email: 'omar@gmail.com',
    avatar: '',
  },
  navMain: [
    {
      title: 'Home',
      url: '/',
      icon: IconHome,
    },
    {
      title: 'Main Categories',
      url: '/main-categories',
      icon: IconFolder,
    },
    {
      title: 'Categories',
      url: '/categories',
      icon: IconFolder,
    },
    {
      title: 'Sub Categories',
      url: '/sub-categories',
      icon: IconFolder,
    },
    {
      title: 'Hierarchy Categories',
      url: '/hierarchy-categories',
      icon: IconFolder,
    },
    {
      title: 'Products',
      url: '/products',
      icon: IconTag,
    },
    {
      title: 'Users',
      url: '/users',
      icon: IconUsers,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: IconSettings,
    },
    {
      title: 'Search',
      url: '#',
      icon: IconSearch,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary
          items={data.navSecondary}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
