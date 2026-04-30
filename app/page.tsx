'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSWRConfig } from 'swr'
import { Dashboard } from '@/components/dashboard/dashboard'
import { GroupSpace } from '@/components/group/group-space'
import { SettingsView } from '@/components/settings/settings-view'
import { NotificationsView } from '@/components/notifications/notifications-view'
import { CreateGroupView } from '@/components/groups/create-group-view'
import { AddMembersView } from '@/components/groups/add-members-view'
import { ActivityView } from '@/components/activity/activity-view'
import { ProfileView } from '@/components/profile/profile-view'
import { PeopleView } from '@/components/friends/people-view'
import { InviteView } from '@/components/friends/invite-view'
import { AddExpenseModal } from '@/components/expense/add-expense-modal'
import { SettleModal } from '@/components/settle/settle-modal'
import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import type { Group, Balance } from '@/lib/types'

type View = 'dashboard' | 'group' | 'settings' | 'notifications' | 'create-group' | 'add-members' | 'activity' | 'profile' | 'invite' | 'people' | 'stats'

export default function Home() {
  const { mutate } = useSWRConfig()
  const [view, setView] = useState<View>('dashboard')
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showSettle, setShowSettle] = useState(false)
  const [addExpenseContext, setAddExpenseContext] = useState<{ groupId?: string } | null>(null)

  const { data: unreadNotifications } = useSWR<any[]>('/api/notifications?unread=true', fetcher)
  const unreadCount = unreadNotifications?.length || 0

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group)
    setView('group')
  }

  const handleBack = () => {
    setView('dashboard')
    setSelectedGroup(null)
  }

  const handleSettle = (balance: Balance) => {
    setSelectedBalance(balance)
    setShowSettle(true)
  }

  const handleAddExpense = (expense: any) => {
    console.log('New expense:', expense)
    // Revalidate relevant data
    mutate('/api/groups')
    mutate('/api/users/me/balances')
    if (expense.groupId) {
      mutate(`/api/groups/${expense.groupId}/expenses`)
      mutate(`/api/groups/${expense.groupId}/balances`)
    }
  }

  const handleSettleComplete = () => {
    console.log('Settled:', selectedBalance)
    // Revalidate balances
    mutate('/api/users/me/balances')
    mutate('/api/groups')
    if (selectedGroup) {
      mutate(`/api/groups/${selectedGroup._id || selectedGroup.id}/balances`)
    }
    setSelectedBalance(null)
  }

  return (
    <div className="flex min-h-screen bg-background relative overflow-x-hidden">
      {/* Desktop Mesh Background Decorations */}
      <div className="hidden md:block fixed top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="hidden md:block fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <DesktopSidebar 
        activeView={view} 
        onViewChange={(newView) => setView(newView)} 
        unreadCount={unreadCount}
      />

      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden md:ml-72">
        <AnimatePresence mode="wait">
        {view === 'dashboard' ? (
          <Dashboard
            key="dashboard"
            onAddExpense={() => {
              setAddExpenseContext(null)
              setShowAddExpense(true)
            }}
            onSelectGroup={handleSelectGroup}
            onSettle={handleSettle}
            onOpenSettings={() => setView('settings')}
            onOpenNotifications={() => setView('notifications')}
            onCreateGroup={() => setView('create-group')}
            onOpenProfile={() => setView('profile')}
            onOpenActivity={() => setView('activity')}
            onOpenPeople={() => setView('people')}
          />
        ) : view === 'settings' ? (
          <SettingsView key="settings" onBack={() => setView('dashboard')} />
        ) : view === 'notifications' ? (
          <NotificationsView key="notifications" onBack={() => setView('dashboard')} />
        ) : view === 'create-group' ? (
          <CreateGroupView 
            key="create-group" 
            onBack={() => setView('dashboard')} 
            onComplete={() => {
              mutate('/api/groups')
              setView('dashboard')
            }} 
            onInviteFriend={() => setView('invite')} 
          />
        ) : view === 'add-members' && selectedGroup ? (
          <AddMembersView key="add-members" groupId={selectedGroup._id || selectedGroup.id} onBack={() => setView('group')} onInviteFriend={() => setView('invite')} />
        ) : selectedGroup ? (
          <GroupSpace
            key="group"
            group={selectedGroup}
            onBack={handleBack}
            onAddExpense={() => {
              setAddExpenseContext({ groupId: selectedGroup._id || selectedGroup.id })
              setShowAddExpense(true)
            }}
            onAddMembers={() => setView('add-members')}
          />
        ) : view === 'activity' ? (
          <ActivityView key="activity" onBack={() => setView('dashboard')} />
        ) : view === 'profile' ? (
          <ProfileView key="profile" onBack={() => setView('dashboard')} onOpenSettings={() => setView('settings')} onOpenActivity={() => setView('activity')} />
        ) : view === 'invite' ? (
          <InviteView key="invite" onBack={() => setView(selectedGroup ? 'add-members' : 'create-group')} />
        ) : view === 'people' ? (
          <PeopleView 
            key="people" 
            onBack={() => setView('dashboard')} 
            onSettle={(balance) => handleSettle(balance)}
          />
        ) : null}
      </AnimatePresence>

      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => {
          setShowAddExpense(false)
          setAddExpenseContext(null)
        }}
        onAdd={handleAddExpense}
        defaultGroupId={addExpenseContext?.groupId}
      />

      <SettleModal
        isOpen={showSettle}
        balance={selectedBalance}
        onClose={() => {
          setShowSettle(false)
          setSelectedBalance(null)
        }}
        onSettle={handleSettleComplete}
      />
    </div>
  </div>
  )
}
