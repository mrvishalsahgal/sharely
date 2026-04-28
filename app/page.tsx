'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Dashboard } from '@/components/dashboard/dashboard'
import { GroupSpace } from '@/components/group/group-space'
import { SettingsView } from '@/components/settings/settings-view'
import { NotificationsView } from '@/components/notifications/notifications-view'
import { CreateGroupView } from '@/components/groups/create-group-view'
import { AddMembersView } from '@/components/groups/add-members-view'
import { AddExpenseModal } from '@/components/expense/add-expense-modal'
import { SettleModal } from '@/components/settle/settle-modal'
import type { Group, Balance } from '@/lib/mock-data'

type View = 'dashboard' | 'group' | 'settings' | 'notifications' | 'create-group' | 'add-members'

export default function Home() {
  const [view, setView] = useState<View>('dashboard')
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showSettle, setShowSettle] = useState(false)
  const [addExpenseContext, setAddExpenseContext] = useState<{ groupId?: string } | null>(null)

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

  const handleAddExpense = (expense: { description: string; amount: number; category: string; splitWith: string[] }) => {
    console.log('New expense:', expense)
    // In a real app, this would update the state/database
  }

  const handleSettleComplete = () => {
    console.log('Settled:', selectedBalance)
    // In a real app, this would update the state/database
    setSelectedBalance(null)
  }

  return (
    <>
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
          />
        ) : view === 'settings' ? (
          <SettingsView key="settings" onBack={() => setView('dashboard')} />
        ) : view === 'notifications' ? (
          <NotificationsView key="notifications" onBack={() => setView('dashboard')} />
        ) : view === 'create-group' ? (
          <CreateGroupView key="create-group" onBack={() => setView('dashboard')} onComplete={() => setView('dashboard')} />
        ) : view === 'add-members' && selectedGroup ? (
          <AddMembersView key="add-members" groupId={selectedGroup.id} onBack={() => setView('group')} />
        ) : selectedGroup ? (
          <GroupSpace
            key="group"
            group={selectedGroup}
            onBack={handleBack}
            onAddExpense={() => {
              setAddExpenseContext({ groupId: selectedGroup.id })
              setShowAddExpense(true)
            }}
            onAddMembers={() => setView('add-members')}
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
    </>
  )
}
