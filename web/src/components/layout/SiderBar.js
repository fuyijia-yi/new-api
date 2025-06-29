import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLucideIcon, sidebarIconColors } from '../../helpers/render.js';
import { ChevronLeft } from 'lucide-react';
import { useStyle, styleActions } from '../../context/Style/index.js';
import {
  isAdmin,
  isRoot,
  showError
} from '../../helpers/index.js';

import {
  Nav,
  Divider,
  Tooltip,
} from '@douyinfe/semi-ui';

const routerMap = {
  home: '/',
  channel: '/console/channel',
  token: '/console/token',
  redemption: '/console/redemption',
  topup: '/console/topup',
  user: '/console/user',
  log: '/console/log',
  midjourney: '/console/midjourney',
  setting: '/console/setting',
  about: '/about',
  detail: '/console',
  pricing: '/pricing',
  task: '/console/task',
  playground: '/console/playground',
  personal: '/console/personal',
};

const SiderBar = () => {
  const { t } = useTranslation();
  const { state: styleState, dispatch: styleDispatch } = useStyle();

  const [selectedKeys, setSelectedKeys] = useState(['home']);
  const [isCollapsed, setIsCollapsed] = useState(styleState.siderCollapsed);
  const [chatItems, setChatItems] = useState([]);
  const [openedKeys, setOpenedKeys] = useState([]);
  const location = useLocation();
  const [routerMapState, setRouterMapState] = useState(routerMap);

  const workspaceItems = useMemo(
    () => [
      {
        text: t('数据看板'),
        itemKey: 'detail',
        to: '/detail',
        className:
          localStorage.getItem('enable_data_export') === 'true'
            ? ''
            : 'tableHiddle',
      },
      {
        text: t('API令牌'),
        itemKey: 'token',
        to: '/token',
      },
      {
        text: t('使用日志'),
        itemKey: 'log',
        to: '/log',
      },
      {
        text: t('绘图日志'),
        itemKey: 'midjourney',
        to: '/midjourney',
        className:
          localStorage.getItem('enable_drawing') === 'true'
            ? ''
            : 'tableHiddle',
      },
      {
        text: t('任务日志'),
        itemKey: 'task',
        to: '/task',
        className:
          localStorage.getItem('enable_task') === 'true' ? '' : 'tableHiddle',
      },
    ],
    [
      localStorage.getItem('enable_data_export'),
      localStorage.getItem('enable_drawing'),
      localStorage.getItem('enable_task'),
      t,
    ],
  );

  const financeItems = useMemo(
    () => [
      {
        text: t('钱包'),
        itemKey: 'topup',
        to: '/topup',
      },
      {
        text: t('个人设置'),
        itemKey: 'personal',
        to: '/personal',
      },
    ],
    [t],
  );

  const adminItems = useMemo(
    () => [
      {
        text: t('渠道'),
        itemKey: 'channel',
        to: '/channel',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('兑换码'),
        itemKey: 'redemption',
        to: '/redemption',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('用户管理'),
        itemKey: 'user',
        to: '/user',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('系统设置'),
        itemKey: 'setting',
        to: '/setting',
        className: isRoot() ? '' : 'tableHiddle',
      },
    ],
    [isAdmin(), isRoot(), t],
  );

  const chatMenuItems = useMemo(
    () => [
      {
        text: t('操练场'),
        itemKey: 'playground',
        to: '/playground',
      },
      {
        text: t('聊天'),
        itemKey: 'chat',
        items: chatItems,
      },
    ],
    [chatItems, t],
  );

  // 更新路由映射，添加聊天路由
  const updateRouterMapWithChats = (chats) => {
    const newRouterMap = { ...routerMap };

    if (Array.isArray(chats) && chats.length > 0) {
      for (let i = 0; i < chats.length; i++) {
        newRouterMap['chat' + i] = '/console/chat/' + i;
      }
    }

    setRouterMapState(newRouterMap);
    return newRouterMap;
  };

  // 加载聊天项
  useEffect(() => {
    let chats = localStorage.getItem('chats');
    if (chats) {
      try {
        chats = JSON.parse(chats);
        if (Array.isArray(chats)) {
          let chatItems = [];
          for (let i = 0; i < chats.length; i++) {
            let chat = {};
            for (let key in chats[i]) {
              chat.text = key;
              chat.itemKey = 'chat' + i;
              chat.to = '/console/chat/' + i;
            }
            chatItems.push(chat);
          }
          setChatItems(chatItems);
          updateRouterMapWithChats(chats);
        }
      } catch (e) {
        console.error(e);
        showError('聊天数据解析失败');
      }
    }
  }, []);

  // 根据当前路径设置选中的菜单项
  useEffect(() => {
    const currentPath = location.pathname;
    let matchingKey = Object.keys(routerMapState).find(
      (key) => routerMapState[key] === currentPath,
    );

    // 处理聊天路由
    if (!matchingKey && currentPath.startsWith('/console/chat/')) {
      const chatIndex = currentPath.split('/').pop();
      if (!isNaN(chatIndex)) {
        matchingKey = 'chat' + chatIndex;
      } else {
        matchingKey = 'chat';
      }
    }

    // 如果找到匹配的键，更新选中的键
    if (matchingKey) {
      setSelectedKeys([matchingKey]);
    }
  }, [location.pathname, routerMapState]);

  // 同步折叠状态
  useEffect(() => {
    setIsCollapsed(styleState.siderCollapsed);
  }, [styleState.siderCollapsed]);

  // 获取菜单项对应的颜色
  const getItemColor = (itemKey) => {
    switch (itemKey) {
      case 'detail': return sidebarIconColors.dashboard;
      case 'playground': return sidebarIconColors.terminal;
      case 'chat': return sidebarIconColors.message;
      case 'token': return sidebarIconColors.key;
      case 'log': return sidebarIconColors.chart;
      case 'midjourney': return sidebarIconColors.image;
      case 'task': return sidebarIconColors.check;
      case 'topup': return sidebarIconColors.credit;
      case 'channel': return sidebarIconColors.layers;
      case 'redemption': return sidebarIconColors.gift;
      case 'user':
      case 'personal': return sidebarIconColors.user;
      case 'setting': return sidebarIconColors.settings;
      default:
        // 处理聊天项
        if (itemKey && itemKey.startsWith('chat')) return sidebarIconColors.message;
        return 'currentColor';
    }
  };

  // 渲染自定义菜单项
  const renderNavItem = (item) => {
    // 跳过隐藏的项目
    if (item.className === 'tableHiddle') return null;

    const isSelected = selectedKeys.includes(item.itemKey);
    const textColor = isSelected ? getItemColor(item.itemKey) : 'inherit';

    return (
      <Nav.Item
        key={item.itemKey}
        itemKey={item.itemKey}
        text={
          <div className="flex items-center">
            <span className="truncate font-medium text-sm" style={{ color: textColor }}>
              {item.text}
            </span>
          </div>
        }
        icon={
          <div className="sidebar-icon-container flex-shrink-0">
            {getLucideIcon(item.itemKey, isSelected)}
          </div>
        }
        className={item.className}
      />
    );
  };

  // 渲染子菜单项
  const renderSubItem = (item) => {
    if (item.items && item.items.length > 0) {
      const isSelected = selectedKeys.includes(item.itemKey);
      const textColor = isSelected ? getItemColor(item.itemKey) : 'inherit';

      return (
        <Nav.Sub
          key={item.itemKey}
          itemKey={item.itemKey}
          text={
            <div className="flex items-center">
              <span className="truncate font-medium text-sm" style={{ color: textColor }}>
                {item.text}
              </span>
            </div>
          }
          icon={
            <div className="sidebar-icon-container flex-shrink-0">
              {getLucideIcon(item.itemKey, isSelected)}
            </div>
          }
        >
          {item.items.map((subItem) => {
            const isSubSelected = selectedKeys.includes(subItem.itemKey);
            const subTextColor = isSubSelected ? getItemColor(subItem.itemKey) : 'inherit';

            return (
              <Nav.Item
                key={subItem.itemKey}
                itemKey={subItem.itemKey}
                text={
                  <span className="truncate font-medium text-sm" style={{ color: subTextColor }}>
                    {subItem.text}
                  </span>
                }
              />
            );
          })}
        </Nav.Sub>
      );
    } else {
      return renderNavItem(item);
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-gray-50 dark:bg-gray-800 transition-all duration-300"
      style={{ width: isCollapsed ? '80px' : '240px' }}
    >
      <Nav
        className="flex-grow overflow-y-auto"
        defaultIsCollapsed={styleState.siderCollapsed}
        isCollapsed={isCollapsed}
        onCollapseChange={(collapsed) => {
          setIsCollapsed(collapsed);
          styleDispatch(styleActions.setSiderCollapsed(collapsed));
        }}
        selectedKeys={selectedKeys}
        renderWrapper={({ itemElement, props }) => {
          const to = routerMapState[props.itemKey] || routerMap[props.itemKey];
          if (!to) return itemElement;
          return (
            <Link style={{ textDecoration: 'none' }} to={to}>
              {itemElement}
            </Link>
          );
        }}
        onSelect={(key) => {
          if (openedKeys.includes(key.itemKey)) {
            setOpenedKeys(openedKeys.filter((k) => k !== key.itemKey));
          }
          setSelectedKeys([key.itemKey]);
        }}
        openKeys={openedKeys}
        onOpenChange={(data) => {
          setOpenedKeys(data.openKeys);
        }}
        items={[
          { itemKey: 'chat', text: t('聊天'), icon: getLucideIcon('chat', selectedKeys.includes('chat')),
            items: chatMenuItems.flatMap(item => item.items ? item.items.map(sub => ({itemKey: sub.itemKey, text: sub.text})) : [{itemKey: item.itemKey, text: item.text, icon: getLucideIcon(item.itemKey, selectedKeys.includes(item.itemKey))}] )
          },
          { itemKey: 'divider-1', text: '', type: 'divider' },
          { itemKey: 'workspace', text: t('控制台'), icon: getLucideIcon('dashboard', selectedKeys.includes('dashboard')),
            items: workspaceItems.filter(item => item.className !== 'tableHiddle').map(item => ({itemKey: item.itemKey, text: item.text, icon: getLucideIcon(item.itemKey, selectedKeys.includes(item.itemKey))}))
          },
          ...(isAdmin() ? [
            { itemKey: 'divider-2', text: '', type: 'divider' },
            { itemKey: 'admin', text: t('管理员'), icon: getLucideIcon('settings', selectedKeys.includes('admin')),
              items: adminItems.filter(item => item.className !== 'tableHiddle').map(item => ({itemKey: item.itemKey, text: item.text, icon: getLucideIcon(item.itemKey, selectedKeys.includes(item.itemKey))}))
            }
          ] : []),
          { itemKey: 'divider-3', text: '', type: 'divider' },
          { itemKey: 'user-center', text: t('个人中心'), icon: getLucideIcon('user', selectedKeys.includes('user')),
            items: financeItems.map(item => ({itemKey: item.itemKey, text: item.text, icon: getLucideIcon(item.itemKey, selectedKeys.includes(item.itemKey))}))
          },
        ]}
      >
      </Nav>

      <div
        className="flex items-center justify-center p-2 cursor-pointer border-t border-gray-200 dark:border-gray-700"
        onClick={() => {
          const newCollapsed = !isCollapsed;
          setIsCollapsed(newCollapsed);
          styleDispatch(styleActions.setSiderCollapsed(newCollapsed));
        }}
      >
        <Tooltip content={isCollapsed ? t('展开侧边栏') : t('收起侧边栏')} position="right">
          <div className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronLeft size={20} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default SiderBar;
