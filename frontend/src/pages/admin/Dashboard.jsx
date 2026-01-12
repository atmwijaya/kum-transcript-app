import React, { useState } from 'react';
import { 
  UserGroupIcon, 
  InboxIcon, 
  CheckCircleIcon, 
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  // State untuk statistik
  const [stats, setStats] = useState({
    totalRequest: 156,
    pendingRequest: 18,
    completedRequest: 138,
    totalAnggota: 89
  });

  // Data dummy untuk recent requests
  const recentRequests = [
    { id: 1, name: 'Budi Santoso', nim: '20210001', date: '2024-11-15', status: 'pending' },
    { id: 2, name: 'Siti Aisyah', nim: '20210002', date: '2024-11-14', status: 'completed' },
    { id: 3, name: 'Ahmad Fauzi', nim: '20210003', date: '2024-11-14', status: 'pending' },
    { id: 4, name: 'Rina Melati', nim: '20210004', date: '2024-11-13', status: 'processing' },
    { id: 5, name: 'Dewi Anggraini', nim: '20210005', date: '2024-11-13', status: 'completed' }
  ];

  // Statistik cards
  const statCards = [
    {
      title: 'Total Request',
      value: stats.totalRequest,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      change: '+12% dari bulan lalu'
    },
    {
      title: 'Request Pending',
      value: stats.pendingRequest,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      change: 'Perlu segera diproses'
    },
    {
      title: 'Request Selesai',
      value: stats.completedRequest,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      change: '88% completion rate'
    },
    {
      title: 'Total Anggota',
      value: stats.totalAnggota,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      change: 'Data mahasiswa & alumni'
    }
  ];

  // Status colors
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Status labels
  const getStatusLabel = (status) => {
    switch(status) {
      case 'completed':
        return 'Selesai';
      case 'pending':
        return 'Menunggu';
      case 'processing':
        return 'Diproses';
      default:
        return status;
    }
  };

  // Quick actions
  const quickActions = [
    { 
      title: 'Proses Request', 
      description: 'Lihat dan proses request dari client',
      icon: InboxIcon,
      path: '/admin/requests',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'Tambah Anggota', 
      description: 'Tambahkan data anggota baru',
      icon: UserGroupIcon,
      path: '/admin/anggota/tambah',
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'Input Nilai', 
      description: 'Input data nilai kumulatif',
      icon: ChartBarIcon,
      path: '/admin/nilai/input',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      title: 'Generate Report', 
      description: 'Buat laporan bulanan',
      icon: DocumentTextIcon,
      path: '/admin/reports',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  // System alerts
  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Request Pending',
      message: `${stats.pendingRequest} request menunggu diproses`,
      icon: ExclamationTriangleIcon
    },
    {
      id: 2,
      type: 'info',
      title: 'Maintenance',
      message: 'Jadwal maintenance: Minggu, 03:00-05:00',
      icon: ClockIcon
    },
    {
      id: 3,
      type: 'success',
      title: 'Update Berhasil',
      message: 'Sistem versi 2.1.0 berjalan lancar',
      icon: CheckCircleIcon
    }
  ];

  // Handle button actions
  const handleAddRequest = () => {
    alert('Fitur "Tambah Request" akan diimplementasi nanti');
  };

  const handleProcessRequest = (requestId) => {
    alert(`Proses request ID: ${requestId} - Fitur akan diimplementasi nanti`);
  };

  const handleViewDetails = (requestId) => {
    alert(`Lihat detail request ID: ${requestId} - Fitur akan diimplementasi nanti`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
            <p className="text-gray-600 mt-2">Preview mode - Authentication akan diimplementasi nanti</p>
          </div>
          <button
            onClick={handleAddRequest}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center space-x-2 shadow-sm"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Tambah Request</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
                <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions & Recent Requests */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Aksi Cepat</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => alert(`Navigasi ke: ${action.path} - Fitur akan diimplementasi nanti`)}
                  className="group p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all hover:shadow-md hover:border-blue-200 flex items-start space-x-4 text-left"
                >
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} flex-shrink-0 shadow-sm`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    <div className="mt-2 text-blue-600 text-sm font-medium flex items-center">
                      <span>Klik untuk akses</span>
                      <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Requests Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Request Terbaru</h2>
                <button 
                  onClick={() => alert('Lihat semua request - Fitur akan diimplementasi nanti')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  Lihat Semua
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIM
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{request.name}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-mono">{request.nim}</td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(request.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleViewDetails(request.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 hover:bg-blue-50 rounded"
                          >
                            Detail
                          </button>
                          {request.status === 'pending' && (
                            <button 
                              onClick={() => handleProcessRequest(request.id)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1 hover:bg-green-50 rounded"
                            >
                              Proses
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Menampilkan 5 dari {stats.totalRequest} request
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - System Status & Alerts */}
        <div className="space-y-6">
          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Status Sistem</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                    <CheckCircleIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Database</p>
                    <p className="text-sm text-gray-600">Connected</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Online
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <ChartBarIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Storage Usage</p>
                    <p className="text-sm text-gray-600">65% / 100GB</p>
                  </div>
                </div>
                <div className="w-24">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                    <UserGroupIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Active Sessions</p>
                    <p className="text-sm text-gray-600">3 users online</p>
                  </div>
                </div>
                <span className="text-gray-800 font-medium">3</span>
              </div>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Notifikasi Sistem</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                3 Baru
              </span>
            </div>
            
            <div className="space-y-4">
              {systemAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' :
                    alert.type === 'info' ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' :
                    'bg-green-50 border-green-200 hover:bg-green-100'
                  } transition-colors`}
                >
                  <div className="flex items-start space-x-3">
                    <alert.icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                      alert.type === 'warning' ? 'text-yellow-600' :
                      alert.type === 'info' ? 'text-blue-600' :
                      'text-green-600'
                    }`} />
                    <div>
                      <p className={`font-medium ${
                        alert.type === 'warning' ? 'text-yellow-800' :
                        alert.type === 'info' ? 'text-blue-800' :
                        'text-green-800'
                      }`}>
                        {alert.title}
                      </p>
                      <p className={`text-sm mt-1 ${
                        alert.type === 'warning' ? 'text-yellow-700' :
                        alert.type === 'info' ? 'text-blue-700' :
                        'text-green-700'
                      }`}>
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Ringkasan Performa</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Request Completion Rate</span>
                  <span className="text-sm font-medium text-gray-800">
                    {stats.totalRequest > 0 
                      ? Math.round((stats.completedRequest / stats.totalRequest) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full" 
                    style={{ 
                      width: `${stats.totalRequest > 0 
                        ? Math.round((stats.completedRequest / stats.totalRequest) * 100) 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Average Processing Time</span>
                  <span className="text-sm font-medium text-gray-800">2.3 days</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">User Satisfaction</span>
                  <span className="text-sm font-medium text-gray-800">94%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Mode Footer */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Mode Wireframe / Preview</h3>
          <p className="text-gray-600 mb-4">
            Dashboard ini masih dalam tahap pengembangan. Semua data adalah dummy data untuk preview UI.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button 
              onClick={() => alert('Authentication akan diimplementasi nanti')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Setup Authentication
            </button>
            <button 
              onClick={() => alert('API integration akan diimplementasi nanti')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
            >
              Connect to Backend
            </button>
            <button 
              onClick={() => alert('Real data akan diimplementasi nanti')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              Load Real Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;