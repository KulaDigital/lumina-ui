import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/instance';
import Drawer from '../../components/Drawer';
import AddUser from './AddUser';
import Button from '../../components/Button';
import ViewModal from '../../components/ViewModal';
import EditModal from '../../components/EditModal';
import DeleteModal from '../../components/DeleteModal';
import { useNotification } from '../../components/Notification';

interface UserData {
  user_id: string;
  client_id: number;
  role: string;
  user_name: string;
  phone_number?: string;
  created_at: string;
  status?: string;
}

const Users: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active');

  // Modal states
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<UserData>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async (status: 'active' | 'inactive') => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/admin/users/status/${status}`);
      if (response.data.success) {
        setUsers(response.data.users);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(statusFilter);
  }, [statusFilter]);

  const getRoleBadge = (role: string): string => {
    const classes: Record<string, string> = {
      'super_admin': 'bg-red-100 text-red-700',
      'client': 'bg-blue-100 text-blue-700',
    };
    return classes[role.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const handleAddUser = () => {
    setIsOpen(true);
  };

  const handleUserAdded = () => {
    setIsOpen(false);
    fetchUsers(statusFilter);
  };

  const formatRole = (role: string): string => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleViewUser = (user: UserData) => {
    setSelectedUser(user);
    setViewModal(true);
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setEditFormData(user);
    setEditModal(true);
  };

  const handleDeleteUser = (user: UserData) => {
    setSelectedUser(user);
    setDeleteModal(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedUser) return;

    try {
      setEditLoading(true);
      const payload = {
        role: editFormData.role || selectedUser.role,
        user_name: editFormData.user_name || selectedUser.user_name,
        phone_number: editFormData.phone_number || selectedUser.phone_number,
      };

      const response = await axiosInstance.put(`/admin/users/${selectedUser.user_id}`, payload);

      if (response.data.success) {
        showNotification('User updated successfully!', 'success');
        setEditModal(false);
        fetchUsers(statusFilter);
      }
    } catch (err: any) {
      console.error('Error updating user:', err);
      showNotification(err.response?.data?.error || 'Failed to update user', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      setDeleteLoading(true);
      const response = await axiosInstance.delete(`/admin/users/${selectedUser.user_id}`);

      if (response.data.success) {
        showNotification('User deactivated successfully!', 'success');
        setDeleteModal(false);
        fetchUsers(statusFilter);
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      showNotification(err.response?.data?.error || 'Failed to delete user', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="bg-bg-light min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>
            User Management
          </h1>
          <p className="text-text-secondary font-body">
            Manage all your system users and their roles
          </p>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-xl font-bold text-text-primary font-heading">
            All Users
          </h3>
          <Button 
            onClick={handleAddUser}
            label="+ Add User"
          />
        </div>

        {/* Status Tabs */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex gap-4">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'active'
                ? 'text-white'
                : 'bg-bg-light text-text-secondary hover:bg-gray-200'
            }`}
            style={statusFilter === 'active' ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            Active Users
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'inactive'
                ? 'text-white'
                : 'bg-bg-light text-text-secondary hover:bg-gray-200'
            }`}
            style={statusFilter === 'inactive' ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            Inactive Users
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-text-secondary">Loading users...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-text-secondary">
              No {statusFilter} users found.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-bg-light border-b border-[var(--color-border)]">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    User Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {users.map((user) => (
                  <tr key={user.user_id} className="hover:bg-bg-light transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-text-primary">{user.user_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{user.phone_number || '-'}</td>
                    <td className="px-6 py-4 text-text-secondary text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-light)] transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        disabled={statusFilter === 'inactive'}
                        className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
                          statusFilter === 'inactive'
                            ? 'text-gray-400 border-gray-300 bg-gray-50 cursor-not-allowed pointer-events-none'
                            : 'text-blue-600 border-blue-200 hover:bg-blue-50'
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={statusFilter === 'inactive'}
                        className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
                          statusFilter === 'inactive'
                            ? 'text-gray-400 border-gray-300 bg-gray-50 cursor-not-allowed pointer-events-none'
                            : 'text-[var(--color-error)] border-[var(--color-error)] hover:bg-red-50'
                        }`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Drawer open={isOpen} close={() => setIsOpen(false)}>
          <AddUser close={handleUserAdded} />
        </Drawer>
      </div>

      {/* VIEW MODAL */}
      <ViewModal
        open={viewModal}
        onClose={() => setViewModal(false)}
        title="User Details"
        fields={selectedUser ? [
          { label: 'User Name', value: selectedUser.user_name },
          { label: 'User ID', value: selectedUser.user_id },
          { label: 'Role', value: formatRole(selectedUser.role), isBadge: true, badgeClass: getRoleBadge(selectedUser.role) },
          { label: 'Phone Number', value: selectedUser.phone_number || '-' },
          { label: 'Created Date', value: new Date(selectedUser.created_at).toLocaleString() },
        ] : []}
      />

      {/* EDIT MODAL */}
      <EditModal
        open={editModal}
        onClose={() => setEditModal(false)}
        onSave={handleEditSubmit}
        title="Edit User"
        loading={editLoading}
        fields={selectedUser ? [
          { name: 'user_name', label: 'User Name', type: 'text', value: editFormData.user_name || '', onChange: (v) => setEditFormData({ ...editFormData, user_name: v }) },
          { name: 'role', label: 'Role', type: 'select', value: editFormData.role || '', onChange: (v) => setEditFormData({ ...editFormData, role: v }), options: ['super_admin', 'client'] },
          { name: 'phone_number', label: 'Phone Number', type: 'tel', value: editFormData.phone_number || '', onChange: (v) => setEditFormData({ ...editFormData, phone_number: v }) },
        ] : []}
      />

      {/* DELETE MODAL */}
      <DeleteModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Deactivate User"
        itemName={selectedUser?.user_name || ''}
        loading={deleteLoading}
      />
      {NotificationComponent}
    </div>
  );
};

export default Users;
