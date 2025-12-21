import * as React from 'react';
import {
  IconDiscount,
  IconFileTypeHtml,
  IconFolder,
  IconHome,
  IconInnerShadowTop,
  IconTag,
  IconUsers,
} from '@tabler/icons-react';

import { NavMain } from '~/components/nav-main';
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
import { ShoppingCart } from 'lucide-react';
import { mainAPI } from '~/api/config';

const data = {
  navMain: [
    {
      title: 'Home',
      url: '/app',
      icon: IconHome,
    },
    {
      title: 'Main Categories',
      url: '/app/main-categories',
      icon: IconFolder,
    },
    {
      title: 'Categories',
      url: '/app/categories',
      icon: IconFolder,
    },
    {
      title: 'Sub Categories',
      url: '/app/sub-categories',
      icon: IconFolder,
    },
    {
      title: 'Hierarchy Categories',
      url: '/app/hierarchy-categories',
      icon: IconFolder,
    },
    {
      title: 'Contents',
      url: '/app/contents',
      icon: IconFileTypeHtml,
    },
    {
      title: 'Products',
      url: '/app/products',
      icon: IconTag,
    },
    {
      title: 'Users',
      url: '/app/users',
      icon: IconUsers,
    },
    {
      title: 'Orders',
      url: '/app/orders',
      icon: ShoppingCart,
    },
    {
      title: 'Promocodes',
      url: '/app/promocodes',
      icon: IconDiscount,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = React.useState<{ name: string | null; email: string; surname: string | null } | null>(
    null
  );

  React.useEffect(() => {
    async function getUserData() {
      const token = sessionStorage.getItem('token');
      const resp = await mainAPI.get('/user/info', {
        headers: {
          token,
        },
      });
      if (resp.data.data) {
        setUserData(resp.data.data);
      }
    }
    getUserData();
  }, []);

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
                <span className="text-base font-semibold">Admin Page.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {userData && (
          <NavUser
            user={{
              name: '',
              email: userData.email,
              avatar: '',
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
