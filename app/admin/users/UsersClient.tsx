'use client';

import { useState, useTransition, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Shield,
  Building2,
  User,
  Pencil,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils/formatters';
import type { Profile, Organization, UserRole } from '@/types/database';
import {
  createUserAction,
  updateUserRoleAction,
  deleteUserAction,
} from './actions';

// ─── Design tokens (Coastal Civic) ───────────────────────────────────────────

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; Icon: React.FC<{ className?: string }>; badgeClass: string }
> = {
  admin: {
    label: 'Admin',
    Icon: Shield,
    badgeClass:
      'bg-[#1B2D3A] text-white border-[#1B2D3A] hover:bg-[#1B2D3A]',
  },
  organization: {
    label: 'Organization',
    Icon: Building2,
    badgeClass:
      'bg-[#E8F4F3] text-[#0D7C8F] border-[#0D7C8F]/30 hover:bg-[#E8F4F3]',
  },
  public: {
    label: 'Public',
    Icon: User,
    badgeClass:
      'bg-[#F5F0EB] text-[#8C7E72] border-[#C4B8AD] hover:bg-[#F5F0EB]',
  },
};

// ─── Password generator ───────────────────────────────────────────────────────

function generatePassword(): string {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const arr = new Uint8Array(18);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join('');
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface UsersClientProps {
  initialUsers: Profile[];
  organizations: Pick<Organization, 'id' | 'name'>[];
  currentAdminId: string;
}

// ─── Credentials Modal ────────────────────────────────────────────────────────

function CredentialsModal({
  open,
  name,
  email,
  password,
  onDone,
}: {
  open: boolean;
  name: string;
  email: string;
  password: string;
  onDone: () => void;
}) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const copyText = useCallback(
    async (text: string, setter: (v: boolean) => void) => {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    },
    []
  );

  const copyAll = useCallback(async () => {
    const loginUrl =
      typeof window !== 'undefined' ? `${window.location.origin}/admin/login` : '/admin/login';
    const text = `Name: ${name}\nEmail: ${email}\nPassword: ${password}\nSign in at: ${loginUrl}`;
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }, [name, email, password]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onDone(); }}>
      <DialogContent
        className="bg-white border border-[#C4B8AD] rounded-lg shadow-none max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-[#1B2D3A] font-semibold text-lg">
            User Created
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <p className="text-sm text-[#4A5568] border-l-2 border-amber-400 pl-3 leading-relaxed">
            Send these credentials to <strong>{name}</strong>. The password is shown once
            and cannot be recovered — copy it now.
          </p>

          {/* Email row */}
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-[#8C7E72] font-medium">Email</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-[#1B2D3A] bg-[#F5F0EB] border border-[#C4B8AD] rounded px-3 py-2 font-mono truncate">
                {email}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => copyText(email, setCopiedEmail)}
                aria-label="Copy email"
                className="text-[#8C7E72] hover:text-[#1B2D3A] hover:bg-[#F5F0EB] shrink-0"
              >
                {copiedEmail ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Password row */}
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-[#8C7E72] font-medium">Password</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-[#1B2D3A] bg-[#F5F0EB] border border-[#C4B8AD] rounded px-3 py-2 font-mono truncate">
                {password}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => copyText(password, setCopiedPassword)}
                aria-label="Copy password"
                className="text-[#8C7E72] hover:text-[#1B2D3A] hover:bg-[#F5F0EB] shrink-0"
              >
                {copiedPassword ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <p className="text-xs text-[#8C7E72]">
            They can sign in at <span className="font-mono">/admin/login</span> or{' '}
            <span className="font-mono">/portal/login</span>.
          </p>

          <div className="flex justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={copyAll}
              className="border-[#C4B8AD] text-[#4A5568] hover:bg-[#F5F0EB] min-h-10 text-sm"
            >
              {copiedAll ? (
                <><Check className="w-4 h-4 mr-2 text-[#16A34A]" />Copied</>
              ) : (
                <><Copy className="w-4 h-4 mr-2" />Copy All</>
              )}
            </Button>
            <Button
              type="button"
              onClick={onDone}
              className="bg-[#1B2D3A] hover:bg-[#0D7C8F] text-white border-0 min-h-10"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create User Dialog ───────────────────────────────────────────────────────

function CreateUserDialog({
  organizations,
}: {
  organizations: Pick<Organization, 'id' | 'name'>[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'organization'>('organization');
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();

  // Credentials modal state — shown once after success
  const [createdUser, setCreatedUser] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);

  const handleGeneratePassword = () => {
    setPassword(generatePassword());
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // Reset form state on close
      setSelectedRole('organization');
      setPassword('');
    }
    setOpen(next);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).trim();
    const name = (formData.get('name') as string).trim();
    const role = formData.get('role') as 'admin' | 'organization';
    const organizationId = formData.get('organization_id') as string | null;
    const pw = (formData.get('password') as string);

    startTransition(async () => {
      const result = await createUserAction({
        email,
        password: pw,
        name,
        role,
        organizationId: organizationId ?? undefined,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success('User created.');
      setOpen(false);
      // Show credentials modal after dialog closes
      setCreatedUser({ name, email: result.email, password: pw });
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            className="bg-[#0D7C8F] hover:bg-[#0A6070] text-white border-0 min-h-11 px-4 text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-white border border-[#C4B8AD] rounded-lg shadow-none max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1B2D3A] font-semibold text-lg">
              Create New User
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-name" className="text-sm font-medium text-[#1B2D3A]">
                Full Name <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="create-name"
                name="name"
                required
                placeholder="Jane Smith"
                className="border-[#C4B8AD] focus-visible:ring-[#0D7C8F] min-h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-email" className="text-sm font-medium text-[#1B2D3A]">
                Email Address <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="create-email"
                name="email"
                type="email"
                required
                placeholder="user@example.org"
                className="border-[#C4B8AD] focus-visible:ring-[#0D7C8F] min-h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-password" className="text-sm font-medium text-[#1B2D3A]">
                Password <span aria-hidden="true">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="create-password"
                  name="password"
                  type="text"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="flex-1 border-[#C4B8AD] focus-visible:ring-[#0D7C8F] min-h-10 font-mono text-sm"
                  autoComplete="off"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeneratePassword}
                  title="Generate secure password"
                  aria-label="Generate secure password"
                  className="border-[#C4B8AD] text-[#4A5568] hover:bg-[#F5F0EB] min-h-10 px-3 shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-[#8C7E72]">
                Use the generate button for a secure 18-character password.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-role" className="text-sm font-medium text-[#1B2D3A]">
                Role <span aria-hidden="true">*</span>
              </Label>
              <Select
                name="role"
                value={selectedRole}
                onValueChange={(v) => setSelectedRole(v as 'admin' | 'organization')}
              >
                <SelectTrigger id="create-role" className="border-[#C4B8AD] focus:ring-[#0D7C8F] min-h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedRole === 'organization' && (
              <div className="space-y-1.5">
                <Label htmlFor="create-org" className="text-sm font-medium text-[#1B2D3A]">
                  Organization <span aria-hidden="true">*</span>
                </Label>
                <Select name="organization_id" required>
                  <SelectTrigger id="create-org" className="border-[#C4B8AD] focus:ring-[#0D7C8F] min-h-10">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <p className="text-xs text-[#8C7E72] border-l-2 border-[#C4B8AD] pl-3 leading-relaxed">
              The account is created immediately. You will be shown the credentials
              once — copy them before closing.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="border-[#C4B8AD] text-[#4A5568] hover:bg-[#F5F0EB] min-h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#0D7C8F] hover:bg-[#0A6070] text-white border-0 min-h-10"
              >
                {isPending ? 'Creating…' : 'Create User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {createdUser && (
        <CredentialsModal
          open={!!createdUser}
          name={createdUser.name}
          email={createdUser.email}
          password={createdUser.password}
          onDone={() => setCreatedUser(null)}
        />
      )}
    </>
  );
}

// ─── Change Role Dialog ───────────────────────────────────────────────────────

function ChangeRoleDialog({
  user,
  organizations,
  isSelf,
}: {
  user: Profile;
  organizations: Pick<Organization, 'id' | 'name'>[];
  isSelf: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [nextRole, setNextRole] = useState<UserRole>(user.role);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const role = formData.get('role') as UserRole;
    const organizationId = formData.get('organization_id') as string | null;

    startTransition(async () => {
      const result = await updateUserRoleAction({
        userId: user.id,
        nextRole: role,
        organizationId: organizationId ?? undefined,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(`Role updated to ${ROLE_CONFIG[role].label}.`);
      setOpen(false);
    });
  };

  if (isSelf) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        title="You cannot modify your own admin status here"
        aria-label="Cannot modify your own role"
        className="text-[#C4B8AD] cursor-not-allowed"
      >
        <Pencil className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Change role"
          aria-label={`Change role for ${user.name ?? user.email}`}
          className="text-[#8C7E72] hover:text-[#1B2D3A] hover:bg-[#F5F0EB]"
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white border border-[#C4B8AD] rounded-lg shadow-none max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1B2D3A] font-semibold text-lg">
            Change Role
          </DialogTitle>
          <p className="text-sm text-[#8C7E72] mt-1">
            {user.name ?? user.email}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor={`role-${user.id}`} className="text-sm font-medium text-[#1B2D3A]">
              New Role <span aria-hidden="true">*</span>
            </Label>
            <Select
              name="role"
              value={nextRole}
              onValueChange={(v) => setNextRole(v as UserRole)}
            >
              <SelectTrigger id={`role-${user.id}`} className="border-[#C4B8AD] focus:ring-[#0D7C8F] min-h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {nextRole === 'organization' && (
            <div className="space-y-1.5">
              <Label htmlFor={`org-${user.id}`} className="text-sm font-medium text-[#1B2D3A]">
                Organization <span aria-hidden="true">*</span>
              </Label>
              <Select
                name="organization_id"
                defaultValue={user.organization_id ?? undefined}
                required
              >
                <SelectTrigger id={`org-${user.id}`} className="border-[#C4B8AD] focus:ring-[#0D7C8F] min-h-10">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="border-[#C4B8AD] text-[#4A5568] hover:bg-[#F5F0EB] min-h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#0D7C8F] hover:bg-[#0A6070] text-white border-0 min-h-10"
            >
              {isPending ? 'Saving…' : 'Save Role'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Button ────────────────────────────────────────────────────────────

function DeleteButton({
  user,
  isSelf,
}: {
  user: Profile;
  isSelf: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (isSelf) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        title="You cannot delete your own account"
        aria-label="Cannot delete your own account"
        className="text-[#C4B8AD] cursor-not-allowed"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    );
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUserAction(user.id);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success(`${user.name ?? user.email} has been removed.`);
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          aria-label={`Delete ${user.name ?? user.email}`}
          className="text-[#8C7E72] hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border border-[#C4B8AD] shadow-none max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1B2D3A]">
            <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
            Delete User
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[#4A5568]">
          This will permanently delete{' '}
          <strong>{user.name ?? user.email}</strong> and revoke their access.
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="border-[#C4B8AD] text-[#4A5568] hover:bg-[#F5F0EB] min-h-10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white border-0 min-h-10"
          >
            {isPending ? 'Deleting…' : 'Delete User'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function UsersClient({
  initialUsers,
  organizations,
  currentAdminId,
}: UsersClientProps) {
  const totalAdmins = initialUsers.filter((u) => u.role === 'admin').length;
  const totalOrg = initialUsers.filter((u) => u.role === 'organization').length;

  const getOrgName = (orgId?: string): string => {
    if (!orgId) return '—';
    return organizations.find((o) => o.id === orgId)?.name ?? 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1B2D3A]">
            User Management
          </h1>
          <p className="text-sm text-[#8C7E72] mt-1">
            Manage admin and organization accounts for Carteret County Food &amp; Health Council.
          </p>
        </div>
        <CreateUserDialog organizations={organizations} />
      </header>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-[#C4B8AD] bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#8C7E72]">
                Total Users
              </p>
              <p className="text-3xl font-semibold text-[#1B2D3A] mt-1">
                {initialUsers.length}
              </p>
            </div>
            <User className="h-7 w-7 text-[#C4B8AD]" aria-hidden="true" />
          </div>
        </div>

        <div className="rounded-lg border border-[#C4B8AD] bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#8C7E72]">
                Admins
              </p>
              <p className="text-3xl font-semibold text-[#1B2D3A] mt-1">
                {totalAdmins}
              </p>
            </div>
            <Shield className="h-7 w-7 text-[#C4B8AD]" aria-hidden="true" />
          </div>
        </div>

        <div className="rounded-lg border border-[#C4B8AD] bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#8C7E72]">
                Organization Users
              </p>
              <p className="text-3xl font-semibold text-[#1B2D3A] mt-1">
                {totalOrg}
              </p>
            </div>
            <Building2 className="h-7 w-7 text-[#C4B8AD]" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Users table */}
      <section
        aria-label="All users"
        className="rounded-lg border border-[#C4B8AD] bg-white overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[#C4B8AD]">
          <h2 className="text-sm font-semibold text-[#1B2D3A]">All Users</h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#C4B8AD] hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wider text-[#8C7E72] font-medium">
                  Name
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-[#8C7E72] font-medium">
                  Email
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-[#8C7E72] font-medium">
                  Role
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-[#8C7E72] font-medium">
                  Organization
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-[#8C7E72] font-medium">
                  Joined
                </TableHead>
                <TableHead className="w-[88px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {initialUsers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-[#8C7E72] py-12 text-sm"
                  >
                    No users found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
              {initialUsers.map((user) => {
                const isSelf = user.id === currentAdminId;
                const { Icon, label, badgeClass } = ROLE_CONFIG[user.role];

                return (
                  <TableRow
                    key={user.id}
                    className="border-[#C4B8AD] hover:bg-[#F5F0EB]/40"
                  >
                    <TableCell className="font-medium text-[#1B2D3A]">
                      {user.name ?? '—'}
                      {isSelf && (
                        <span className="ml-2 text-xs text-[#8C7E72]">(you)</span>
                      )}
                    </TableCell>

                    <TableCell className="text-[#4A5568]">
                      {user.email}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={`${badgeClass} text-xs font-medium gap-1 border pointer-events-none`}
                      >
                        <Icon className="w-3 h-3" aria-hidden="true" />
                        {label}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-[#4A5568]">
                      {getOrgName(user.organization_id ?? undefined)}
                    </TableCell>

                    <TableCell className="text-sm text-[#8C7E72]">
                      {formatDate(user.created_at)}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ChangeRoleDialog
                          user={user}
                          organizations={organizations}
                          isSelf={isSelf}
                        />
                        <DeleteButton user={user} isSelf={isSelf} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
