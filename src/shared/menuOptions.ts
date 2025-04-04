import { h, Component, ref } from 'vue'
import { HomeOutline, AddCircleOutline, AppsOutline, DownloadOutline, IdCardOutline, StatsChartOutline, PeopleOutline, CloudyOutline, ConstructOutline, WalletOutline, BuildOutline, PricetagsOutline, SettingsOutline } from '@vicons/ionicons5'
import { NIcon, type MenuOption } from 'naive-ui'

const baseMenuOptions: MenuOption[] = [
  {
    label: '面板首页',
    icon: renderIcon(HomeOutline),
    key: 'dashboardIndex',
    link: '/dashboard/home',
  },
  {
    label: '创建隧道',
    icon: renderIcon(AddCircleOutline),
    key: 'create-tunnel',
    link: '/dashboard/proxy/create',
  },
  {
    label: '隧道管理',
    icon: renderIcon(AppsOutline),
    key: 'proxy-list',
    link: '/dashboard/proxy/list',
  },
  {
    label: '节点监控',
    icon: renderIcon(StatsChartOutline),
    key: 'node-status',
    link: '/dashboard/node/status',
  },
  {
    label: '文件下载',
    icon: renderIcon(DownloadOutline),
    key: 'downloads',
    link: '/dashboard/downloads',
  },
  // {
  //   label: '帮助中心',
  //   icon: renderIcon(HelpCircleOutline),
  //   key: 'help',
  //   link: '/dashboard/help',
  // },
  {
    label: '用户中心',
    icon: renderIcon(IdCardOutline),
    key: 'user-section',
    children: [
      {
        label: '个人中心',
        key: 'user-profile',
        link: '/dashboard/user/profile',
      },
        {
          label: '我的资料',
          key: 'user-my-profile',
          link: '/dashboard/user/my-profile',
        },
    ],
  },
  {
    label: '增值服务',
    key: 'cash',
    icon: renderIcon(WalletOutline),
    link: '/dashboard/cash',
  },
]

const adminMenuOptions: MenuOption = {
  label: '管理中心',
  icon: renderIcon(ConstructOutline),
  key: 'admin',
  children: [
    {
      label: '用户管理',
      key: 'admin-users',
      link: '/dashboard/admin/users',
      icon: renderIcon(PeopleOutline)
    },
    {
      label: '节点管理',
      key: 'admin-nodes',
      link: '/dashboard/admin/nodes',
      icon: renderIcon(CloudyOutline)
    },
    {
      label: '隧道管理',
      key: 'admin-proxies',
      link: '/dashboard/admin/proxies',
      icon: renderIcon(AppsOutline)
    },
    {
      label: '产品管理',
      key: 'admin-products',
      link: '/dashboard/admin/products',
      icon: renderIcon(BuildOutline)
    },
    {
      label: '广告管理',
      key: 'admin-ads',
      link: '/dashboard/admin/ads',
      icon: renderIcon(PricetagsOutline)
    },
    {
      label: '系统管理',
      key: 'admin-system',
      link: '/dashboard/admin/system',
      icon: renderIcon(SettingsOutline)
    }
  ]
}

export function getMenuOptions(): MenuOption[] {
  const userGroup = localStorage.getItem('group')
  const options = [...baseMenuOptions]

  //options.push(moreMenuOptions)
  if (userGroup === 'admin') {
    options.push(adminMenuOptions)
    defaultExpandedKeys.value.push('admin')
  }
  return options
}

export function renderIcon(icon: Component) {
  return () => h(NIcon, {
    component: icon,
    size: 22
  })
}

export const defaultExpandedKeys = ref<string[]>(['more'])