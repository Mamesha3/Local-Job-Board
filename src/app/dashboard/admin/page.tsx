'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { NotificationBell } from '@/components/NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  Ban,
  UserCheck,
  Star,
  AlertTriangle,
  Activity,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  useAdminStats,
  useAllUsers,
  useAllCompanies,
  useAllJobs,
  useAuditLogs,
  useCreateAuditLog,
  useUpdateUserRole,
  useVerifyCompany,
  useModerateJob,
  useDeleteUser,
  useDeleteCompany,
  useDeleteJob,
} from '@/hooks/useAdmin';
import { useCompanyByOwner } from '@/hooks/useCompanies';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, profile, role, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'companies' | 'jobs' | 'audit'>('overview');

  if (!user || role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">You must be an admin to view this page.</p>
          <Link href="/login" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500">Manage users, companies, jobs, and content</p>
                {profile && (
                  <p className="text-sm text-indigo-600 font-medium">
                    Welcome, {profile.fullName}
                  </p>
                )}
              </div>
            </div>
            {/* Notification Bell */}
            <NotificationBell userId={user.$id} />

            {/* Logout Button */}
            {/* <button
              onClick={() => logout()}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button> */}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6"
        >
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'companies', label: 'Companies', icon: Building2 },
              { id: 'jobs', label: 'Jobs', icon: Briefcase },
              { id: 'audit', label: 'Audit Logs', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center cursor-pointer gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <OverviewTab key="overview" />}
          {activeTab === 'users' && <UsersTab key="users" />}
          {activeTab === 'companies' && <CompaniesTab key="companies" />}
          {activeTab === 'jobs' && <JobsTab key="jobs" />}
          {activeTab === 'audit' && <AuditTab key="audit" />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Overview Tab
function OverviewTab() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex justify-center py-12"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
        />
      </motion.div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Companies', value: stats?.totalCompanies || 0, icon: Building2, color: 'bg-purple-500' },
    { label: 'Total Jobs', value: stats?.totalJobs || 0, icon: Briefcase, color: 'bg-green-500' },
    { label: 'Applications', value: stats?.totalApplications || 0, icon: FileText, color: 'bg-orange-500' },
    { label: 'Pending Verifications', value: stats?.pendingVerifications || 0, icon: Clock, color: 'bg-yellow-500', alert: true },
    { label: 'Suspended Users', value: stats?.suspendedUsers || 0, icon: AlertTriangle, color: 'bg-red-500', alert: (stats?.suspendedUsers || 0) > 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className={`bg-white p-6 rounded-xl shadow-sm border ${stat.alert ? 'border-red-200' : 'border-gray-200'} hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.alert ? 'text-red-600' : 'text-gray-900'}`}>
                {stat.value}
              </p>
            </div>
            <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// User Row Component - shows profile picture or company logo
function UserRow({ user, adminId }: { user: any; adminId: string }) {
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const createAuditLog = useCreateAuditLog();
  const { data: company } = useCompanyByOwner(user.$id);

  const handleUpdateRole = (userId: string, newRole: 'seeker' | 'company' | 'admin', currentRole: string) => {
    updateRole.mutate({ userId, role: newRole }, {
      onSuccess: () => {
        createAuditLog.mutate({
          action: 'UPDATE_USER_ROLE',
          performedBy: adminId,
          targetType: 'user',
          targetId: userId,
          details: `Changed role from ${currentRole} to ${newRole}`,
          $sequence: ''
        });
      },
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUser.mutate(userId, {
        onSuccess: () => {
          createAuditLog.mutate({
            action: 'DELETE_USER',
            performedBy: adminId,
            targetType: 'user',
            targetId: userId,
            details: `Deleted user: ${userName}`,
            $sequence: ''
          });
        },
      });
    }
  };

  // Determine what image to show
  let imageUrl: string | null = null;
  let isCompanyLogo = false;

  if ((user.role === 'employer' || user.role === 'company') && company?.logoId) {
    imageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace('/v1', '')}/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${company.logoId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;
    isCompanyLogo = true;
  } else if ((user as { profilePictureId?: string }).profilePictureId) {
    imageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace('/v1', '')}/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${(user as { profilePictureId?: string }).profilePictureId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={isCompanyLogo ? company?.name : user.fullName}
              className={`w-10 h-10 object-cover ${isCompanyLogo ? 'rounded-lg' : 'rounded-full'}`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className={`w-10 h-10 flex items-center justify-center ${isCompanyLogo ? 'bg-purple-100 rounded-lg' : 'bg-indigo-100 rounded-full'}`}>
              {isCompanyLogo ? <Building2 className="w-5 h-5 text-purple-600" /> : <Users className="w-5 h-5 text-indigo-600" />}
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{user.fullName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
          user.role === 'employer' ? 'bg-blue-100 text-blue-700' :
          'bg-green-100 text-green-700'
        }`}>
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {new Date(user.$createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {user.role !== 'seeker' && (
            <button
              onClick={() => handleUpdateRole(user.$id, 'seeker', user.role)}
              disabled={updateRole.isPending}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded text-xs cursor-pointer"
              title="Set as Seeker"
            >
              S
            </button>
          )}
          {user.role !== 'employer' && user.role !== 'company' && (
            <button
              onClick={() => handleUpdateRole(user.$id, 'company', user.role)}
              disabled={updateRole.isPending}
              className="p-1 text-purple-600 hover:bg-purple-50 rounded text-xs cursor-pointer"
              title="Set as Employer"
            >
              E
            </button>
          )}
          {user.role !== 'admin' && (
            <button
              onClick={() => handleUpdateRole(user.$id, 'admin', user.role)}
              disabled={updateRole.isPending}
              className="p-1 text-orange-600 hover:bg-orange-50 rounded text-xs cursor-pointer"
              title="Set as Admin"
            >
              A
            </button>
          )}
          <button
            onClick={() => handleDeleteUser(user.$id, user.fullName)}
            disabled={deleteUser.isPending}
            className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// Users Tab
function UsersTab() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useAllUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'seeker' | 'employer' | 'admin'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
        />
      </motion.div>
    );
  }

  const filteredUsers = users?.filter((user) => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalItems = filteredUsers?.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedUsers = filteredUsers?.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset to page 1 when filters change
  const handleFilterChange = (value: string) => {
    setFilterRole(value as typeof filterRole);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200"
    >
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Roles</option>
          <option value="seeker">Seeker</option>
          <option value="employer">Company</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Joined</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedUsers?.map((user) => (
              <UserRow key={user.$id} user={user} adminId={currentUser?.$id || ''} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} users
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Companies Tab
function CompaniesTab() {
  const { user: currentUser } = useAuth();
  const { data: companies, isLoading } = useAllCompanies();
  const verifyCompany = useVerifyCompany();
  const deleteCompany = useDeleteCompany();
  const createAuditLog = useCreateAuditLog();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleVerifyCompany = (companyId: string, companyName: string, isVerified: boolean) => {
    verifyCompany.mutate({ companyId, isVerified }, {
      onSuccess: () => {
        createAuditLog.mutate({
          action: isVerified ? 'VERIFY_COMPANY' : 'UNVERIFY_COMPANY',
          performedBy: currentUser?.$id || '',
          targetType: 'company',
          targetId: companyId,
          details: `${isVerified ? 'Verified' : 'Unverified'} company: ${companyName}`,
          $sequence: ''
        });
      },
    });
  };

  const handleDeleteCompany = (companyId: string, companyName: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      deleteCompany.mutate({ companyId }, {
        onSuccess: () => {
          createAuditLog.mutate({
            action: 'DELETE_COMPANY',
            performedBy: currentUser?.$id || '',
            targetType: 'company',
            targetId: companyId,
            details: `Deleted company: ${companyName}`,
            $sequence: ''
          });
        },
      });
    }
  };

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
        />
      </motion.div>
    );
  }

  const filteredCompanies = companies?.filter((company) => {
    const matchesSearch = company.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVerified = filterVerified === 'all' ||
      (filterVerified === 'verified' && company.isVerified) ||
      (filterVerified === 'unverified' && !company.isVerified);
    return matchesSearch && matchesVerified;
  });

  // Pagination
  const totalItems = filteredCompanies?.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedCompanies = filteredCompanies?.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset to page 1 when filters change
  const handleFilterChange = (value: string) => {
    setFilterVerified(value as typeof filterVerified);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200"
    >
      <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filterVerified}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Company</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Location</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Verified</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Joined</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedCompanies?.map((company) => (
              <tr key={company.$id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {company.logoId ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace('/v1', '')}/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${company.logoId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`}
                        alt={company.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{company.name}</p>
                      <p className="text-sm text-gray-500">{company.website || 'No website'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{company.location}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    company.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {company.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(company.$createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {!company.isVerified && (
                      <button
                        onClick={() => handleVerifyCompany(company.$id, company.name, true)}
                        disabled={verifyCompany.isPending}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Verify"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {company.isVerified && (
                      <button
                        onClick={() => handleVerifyCompany(company.$id, company.name, false)}
                        disabled={verifyCompany.isPending}
                        className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                        title="Unverify"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCompany(company.$id, company.name)}
                      disabled={deleteCompany.isPending}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} companies
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Jobs Tab
function JobsTab() {
  const { user: currentUser } = useAuth();
  const { data: jobs, isLoading } = useAllJobs();
  const moderateJob = useModerateJob();
  const deleteJob = useDeleteJob();
  const createAuditLog = useCreateAuditLog();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleModerateJob = (jobId: string, jobTitle: string, action: 'approve' | 'reject' | 'feature' | 'unfeature') => {
    moderateJob.mutate({ jobId, action }, {
      onSuccess: () => {
        createAuditLog.mutate({
          action: action === 'reject' ? 'REJECT_JOB' : action === 'approve' ? 'APPROVE_JOB' : action === 'feature' ? 'FEATURE_JOB' : 'UNFEATURE_JOB',
          performedBy: currentUser?.$id || '',
          targetType: 'job',
          targetId: jobId,
          details: `Job "${jobTitle}" ${action}d`,
          $sequence: ''
        });
      },
    });
  };

  const handleDeleteJob = (jobId: string, jobTitle: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      deleteJob.mutate(jobId, {
        onSuccess: () => {
          createAuditLog.mutate({
            action: 'DELETE_JOB',
            performedBy: currentUser?.$id || '',
            targetType: 'job',
            targetId: jobId,
            details: `Deleted job: ${jobTitle}`,
            $sequence: ''
          });
        },
      });
    }
  };

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
        />
      </motion.div>
    );
  }

  const filteredJobs = jobs?.filter((job) =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.companyId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalItems = filteredJobs?.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedJobs = filteredJobs?.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200"
    >
      <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Job</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Featured</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Posted</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedJobs?.map((job) => (
              <tr key={job.$id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.location}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    job.status === 'active' ? 'bg-green-100 text-green-700' :
                    job.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {job.isFeatured ? (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Star className="w-4 h-4 fill-current" />
                      Featured
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(job.$createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {job.isFeatured ? (
                      <button
                        onClick={() => handleModerateJob(job.$id, job.title, 'unfeature')}
                        disabled={moderateJob.isPending}
                        className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                        title="Unfeature"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    ) : job.status === 'active' && (
                      <button
                        onClick={() => handleModerateJob(job.$id, job.title, 'feature')}
                        disabled={moderateJob.isPending}
                        className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                        title="Feature"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <Link
                      href={`/jobs/${job.$id}?returnTo=admin`}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteJob(job.$id, job.title)}
                      disabled={deleteJob.isPending}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} jobs
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Audit Tab
function AuditTab() {
  const { data: logs, isLoading } = useAuditLogs();
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const pageSize = 10;

  // Filter logs by date
  const filteredLogs = logs?.filter((log) => {
    if (dateFilter === 'all') return true;
    
    // Convert UTC dates to local date strings for comparison
    const logDate = new Date(log.$createdAt);
    const logDateStr = new Date(logDate.getTime() - logDate.getTimezoneOffset() * 60000)
      .toISOString().split('T')[0]; // YYYY-MM-DD in local time
    
    const now = new Date();
    const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000 + (24 * 60 * 60 * 1000)))
    .toISOString().split('T')[0]; // YYYY-MM-DD in local time
      
    
    // Get start of today at midnight in local time
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case 'today':
        // Compare date strings for exact match
        return logDateStr === todayStr;
      case 'week': {
        const weekAgo = new Date(startOfToday);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate >= weekAgo;
      }
      case 'month': {
        const monthAgo = new Date(startOfToday);
        monthAgo.setDate(monthAgo.getDate() - 30);
        return logDate >= monthAgo;
      }
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
        />
      </motion.div>
    );
  }

  // Pagination
  const totalItems = filteredLogs?.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLogs = filteredLogs?.slice(startIndex, startIndex + pageSize);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200"
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500">Audit log of admin actions</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month');
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Target</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Details</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedLogs?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No audit logs found
                </td>
              </tr>
            ) : (
              paginatedLogs?.map((log) => (
                <tr key={log.$id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {log.targetType}: {log.targetId.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.details}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(log.$createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
