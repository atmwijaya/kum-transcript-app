import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeIcon,
  InboxIcon,
  UsersIcon,
  BookmarkIcon,
  WrenchIcon,
  CakeIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import logoImage from "./../../assets/Radip.png"; 

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: HomeIcon,
      path: "/admin/dashboard",
    },
    {
      id: "anggota",
      name: "Daftar Anggota",
      icon: UsersIcon,
      path: "/admin/anggota",
    },
    {
      id: "sku-pandega",
      name: "SKU Pandega",
      icon: InboxIcon,
      path: "/admin/sku-pandega",
    },
    {
      id: "nilai",
      name: "Rekap Nilai KUM",
      icon: ChartBarIcon,
      path: "/admin/rekap-nilai-kum",
    },
    {
      id: "ultah",
      name: "Ultah KBRD",
      icon: CakeIcon,
      path: "/admin/ultah",
    },
    {
      id: "pengaturan",
      name: "Pengaturan",
      icon: WrenchIcon,
      path: "/admin/pengaturan",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={`
        ${isCollapsed ? "w-20" : "w-64"} 
        bg-blue-900 text-white
        transition-all duration-300 ease-in-out
        flex flex-col
        h-screen
        sticky top-0
      `}
    >
      {/* Header Logo dengan Gambar */}
      <div className="p-4 border-b border-gray-700 relative">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <img
              src={logoImage}
              alt="Portal Adat Logo"
              className="h-10 w-10 object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden transition-opacity duration-300">
              <h1 className="text-xl font-bold truncate">Portal Adat</h1>
              <p className="text-xs text-gray-400 truncate">
                Pemangku Adat Racana Diponegoro
              </p>
            </div>
          )}
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 
                   bg-blue-800 hover:bg-blue-700 rounded-full p-1 
                   transition-all duration-300"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4 text-white" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4 text-white" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center 
                  ${isCollapsed ? "justify-center" : "space-x-3"} 
                  p-3 rounded-lg
                  transition-all duration-200
                  ${
                    location.pathname === item.path
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-800 text-gray-300"
                  }
                `}
                title={isCollapsed ? item.name : ""} // Tooltip saat collapsed
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="truncate text-left">{item.name}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center 
            ${isCollapsed ? "justify-center" : "justify-center space-x-2"} 
            p-3 hover:bg-red-900/30 text-red-300 rounded-lg
            transition-all duration-200
          `}
          title={isCollapsed ? "Logout" : ""}
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;