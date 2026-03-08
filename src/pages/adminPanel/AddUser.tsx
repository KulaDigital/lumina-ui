import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import Card from '../../components/FormCard';
import Input from '../../components/FormInput';
import Select from '../../components/FormSelect';
import { adminClientsApi, adminUsersApi } from '../../api';
import { useNotification } from '../../components/Notification';

interface AddUserProps {
  close: () => void;
}

interface ClientOption {
  id: number;
  company_name: string;
}

const AddUser: React.FC<AddUserProps> = ({ close }) => {
  const { showNotification, NotificationComponent } = useNotification();
  const [formData, setFormData] = useState({
    supabaseUserId: '',
    userName: '',
    role: '',
    clientName: '',
    phoneNumber: '',
  });

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = ['Super Admin', 'Client'];

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await adminClientsApi.getClientsByStatus('active');
        if (response.success) {
          setClients(response.clients);
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    };

    fetchClients();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear client name if role changes to Super Admin
    if (field === 'role' && value === 'Super Admin') {
      setFormData((prev) => ({
        ...prev,
        clientName: '',
      }));
    }
  };

  const handleAddUserClick = async () => {
    // Validate required fields
    if (!formData.supabaseUserId.trim()) {
      setError('Supabase User ID is required');
      return;
    }
    if (!formData.userName.trim()) {
      setError('User Name is required');
      return;
    }
    if (!formData.role) {
      setError('Role is required');
      return;
    }
    if (formData.role === 'Client' && !formData.clientName) {
      setError('Client Name is required for Client role');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert role to backend format
      const roleValue = formData.role === 'Super Admin' ? 'super_admin' : 'client';

      const payload = {
        user_id: formData.supabaseUserId,
        user_name: formData.userName,
        role: roleValue,
        company_name: formData.clientName || '', // Will be ignored for super_admin
        phone_number: formData.phoneNumber || undefined,
      };

      const response = await adminUsersApi.createUser(payload);

      if (response.success) {
        showNotification('User created successfully!', 'success');
        close();
      }
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-20">
      {/* HEADER */}
      <div className="mb-4">
        <h1 className="text-text-primary font-heading">Add New User</h1>
        <p className="text-text-secondary font-body text-sm mt-1">
          Fill in the details below to onboard a new user
        </p>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* USER INFORMATION */}
      <Card title="User Information">
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Supabase User ID"
            required
            value={formData.supabaseUserId}
            onChange={(v: string) => handleChange('supabaseUserId', v)}
          />
          <Input
            label="User Name"
            required
            value={formData.userName}
            onChange={(v: string) => handleChange('userName', v)}
          />
          <Select
            label="Role"
            required
            value={formData.role}
            onChange={(v: string) => handleChange('role', v)}
            options={roles}
          />
          {formData.role === 'Client' && (
            <Select
              label="Client Name"
              required
              value={formData.clientName}
              onChange={(v: string) => handleChange('clientName', v)}
              options={clients.map((c) => c.company_name)}
            />
          )}
        </div>
      </Card>

      {/* CLIENT NOTE */}
      {formData.role === 'Client' && (
        <div className="flex items-start gap-3 p-4 border border-[var(--color-warning)] bg-[var(--color-warning-light, rgba(245, 158, 11, 0.1))] rounded-lg">
          <span className="text-lg flex-shrink-0">ℹ️</span>
          <div>
            <p className="font-medium text-sm text-[var(--color-warning)]">Note</p>
            <p className="text-xs text-[var(--color-warning)] mt-1">
              If you couldn't find the client, add client first in the Clients section
            </p>
          </div>
        </div>
      )}

      {/* CONTACT INFORMATION */}
      <Card title="Contact Information">
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(v: string) => handleChange('phoneNumber', v)}
          />
        </div>
      </Card>

      {/* ACTIONS */}
      <div className="flex justify-end gap-4 sticky bottom-0 bg-white px-6 py-4 border-t border-[var(--color-border)]">
        <Button label={'Cancel'} onClick={close} color="secondary" variant="outline" />
        <Button
          onClick={handleAddUserClick}
          label={loading ? 'Adding...' : 'Add User'}
          disabled={loading}
        />
      </div>
      {NotificationComponent}
    </div>
  );
};

export default AddUser;
