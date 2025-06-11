"use client"

import { useEffect, useState } from "react"
import { LineChart, BarChart, PieChart } from "@mui/x-charts"
import { DataGrid } from "@mui/x-data-grid"
import { Building2, Users, DollarSign, Home, ArrowUpRight, Search, Filter, Download, RefreshCw, Calendar, IndianRupee } from "lucide-react"
import axios from "axios"
import { COMMISSION_DATA, PROPERTIES_COUNT, PROPERTIES_IN_CATEGORY, PROPERTIES_IN_DISTRICT, USERS_DATA, VIEW_ALL_PROPERTY } from "./auth/api"

export default function Dashboard() {
  const [propertiesInCategory, setPropertiesInCategory] = useState([])
  const [propertiesInDistrict, setPropertiesInDistrict] = useState([])
  const [users, setUsers] = useState([])
  const [properties, setProperties] = useState([])
  const [soldPropertiesCount, setSoldPropertiesCount] = useState({ sold: 0, unsold: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("category")
  const [searchTerm, setSearchTerm] = useState("")
  const [listProperties, setListproperties] = useState([])
  const [commissions, setCommissions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  // Mock data for property cost analysis
  const propertyCostData = {
    totalSales: 4850000,
    averageSalePrice: 485000,
    highestSale: 1250000,
    lowestSale: 175000,
    monthlySales: [320000, 450000, 380000, 520000, 610000, 490000, 580000, 420000, 390000, 480000, 550000, 660000],
  }

  const calculateSoldProperties = () => {
    let soldCount = 0
    let unsoldCount = 0

    properties.forEach((property) => {
      if (property.isSold) {
        soldCount++
      } else {
        unsoldCount++
      }
    })

    setSoldPropertiesCount({ sold: soldCount, unsold: unsoldCount })
  }

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [categoryRes, districtRes, usersRes, propertiesRes, listproperty, commissionRes] = await Promise.all([
        axios.get(PROPERTIES_IN_CATEGORY),
        axios.get(PROPERTIES_IN_DISTRICT),
        axios.get(USERS_DATA),
        axios.get(PROPERTIES_COUNT),
        axios.get(VIEW_ALL_PROPERTY),
        axios.get(COMMISSION_DATA)
      ])
      setCommissions(commissionRes.data.data);
      const years = [...new Set(commissionRes.data.data.map(c => new Date(c.createdAt).getFullYear()))];
      setAvailableYears(years.sort((a, b) => b - a));

      setPropertiesInCategory(categoryRes.data.data)
      setPropertiesInDistrict(districtRes.data.data)
      setUsers(usersRes.data.data)
      setProperties(propertiesRes.data.data)
      setListproperties(listproperty.data.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (properties.length > 0) {
      calculateSoldProperties()
    }
  }, [properties])

  // Process data for charts
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // User growth data
  const monthlyUserCount = new Array(12).fill(0)
  users.forEach((user) => {
    const createdDate = new Date(user.createdAt)
    const month = createdDate.getMonth()
    monthlyUserCount[month]++
  })

  // Property trend data
  const monthlyPropertyCount = new Array(12).fill(0)
  properties.forEach((property) => {
    const createdDate = new Date(property.createdAt)
    const month = createdDate.getMonth()
    monthlyPropertyCount[month]++
  })

  const getCommissionDataByYear = (year) => {
    const yearlyCommissions = commissions.filter(
      c => new Date(c.createdAt).getFullYear() === year
    );
    
    const monthlyCommissions = new Array(12).fill(0);
    yearlyCommissions.forEach(commission => {
      const month = new Date(commission.createdAt).getMonth();
      monthlyCommissions[month] += commission.amount;
    });
    
    const totalCommission = yearlyCommissions.reduce((sum, c) => sum + c.amount, 0);
    const averageCommission = yearlyCommissions.length > 0 
      ? totalCommission / yearlyCommissions.length 
      : 0;
    
    return {
      monthlyCommissions,
      totalCommission,
      averageCommission,
      transactions: yearlyCommissions.length,
      commissionList: yearlyCommissions.map(c => ({
        id: c.id,
        property: c.post.title,
        propertyValue: c.post.price,
        commissionValue: c.amount,
        date: new Date(c.createdAt).toLocaleDateString(),
        notes: c.notes
      }))
    };
  };

  // Get current year's commission data
  const currentYearCommissionData = getCommissionDataByYear(selectedYear);

  // Stats cards data
  const stats = [
    {
      title: "Total Properties",
      value: properties.length,
      icon: <Building2 className="h-5 w-5" />,
      color: "bg-rose-100 text-rose-600",
    },
    {
      title: "Active Users",
      value: users.length,
      icon: <Users className="h-5 w-5" />,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Total Commission",
      value: currentYearCommissionData.totalCommission,
      icon: <IndianRupee className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-600",
      format: true,
    }
  ]

  // Commission chart data
  const commissionChartData = {
    xAxis: [
      {
        data: monthNames,
        scaleType: "band",
      },
    ],
    series: [
      {
        data: currentYearCommissionData.monthlyCommissions,
        label: "Monthly Commissions (₹)",
        color: "#8b5cf6",
        area: true,
        showMark: false,
      },
    ],
  };

  // Commission columns for DataGrid
  const commissionColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'property', headerName: 'Property', width: 200 },
    { 
      field: 'propertyValue', 
      headerName: 'Property Amount', 
      width: 150,
      renderCell: (params) => `₹${params.value.toLocaleString()}`
    },
    { 
      field: 'commissionValue', 
      headerName: 'Commission Amount', 
      width: 120,
      renderCell: (params) => `₹${params.value.toLocaleString()}`
    },
    { field: 'date', headerName: 'Date', width: 120 },
    { 
      field: 'notes', 
      headerName: 'Notes', 
      width: 120,
      renderCell: (params) => (
        <span className='px-2 py-1 rounded-full text-xs'>
          {params.value ? params.value : 'N/A'}
        </span>
      )
    },
  ];

  // User growth chart data
  const userGrowthChartData = {
    xAxis: [
      {
        data: monthNames,
        scaleType: "band",
      },
    ],
    series: [
      {
        data: monthlyUserCount,
        label: "New Users",
        color: "#ec4899",
        area: true,
        showMark: false,
      },
    ],
  }

  // Property trend chart data
  const propertyTrendData = {
    xAxis: [
      {
        data: monthNames,
        scaleType: "band",
      },
    ],
    series: [
      {
        data: monthlyPropertyCount,
        label: "Properties",
        color: "#10b981",
        area: true,
        showMark: false,
      },
    ],
  }

  // Sold vs Unsold properties chart data
  const soldPropertiesChartData = {
    xAxis: [
      {
        data: ["Sold", "Available"],
        scaleType: "band",
      },
    ],
    series: [
      {
        data: [soldPropertiesCount.sold, soldPropertiesCount.unsold],
        label: "Properties Status",
        color: ["#22c55e"], 
      },
    ],
  }

  // Category data for pie chart
  const dynamicCategoryData = {
    series: [
      {
        data: propertiesInCategory.map((item) => ({
          value: item._count.posts,
          label: item.name.charAt(0).toUpperCase() + item.name.slice(1),
        })),
        highlightScope: { faded: "global", highlighted: "item" },
        innerRadius: 50,
        outerRadius: 80,
        paddingAngle: 2,
        cornerRadius: 4,
      },
    ],
    height: 200,
  }

  // District data for pie chart
  const dynamicDistrictData = {
    series: [
      {
        data: propertiesInDistrict.map((item) => ({
          value: item._count.posts,
          label: item.name.charAt(0).toUpperCase() + item.name.slice(1),
        })),
        highlightScope: { faded: "global", highlighted: "item" },
        innerRadius: 50,
        outerRadius: 80,
        paddingAngle: 2,
        cornerRadius: 4,
      },
    ],
    height: 200,
  }

  const propertyListings = listProperties.map((property, index) => ({
    id: property.id || index + 1,
    title: property.title || `Property ${index + 1}`,
    location: property.location || `Location ${index + 1}`,
    price: property.price || Math.floor(Math.random() * 500000) + 100000,
    status: property.isSold ? "Sold" : "Available",
    type: property.type || ["Apartment", "House", "Villa", "Land"][Math.floor(Math.random() * 4)],
    date: property.createdAt || new Date().toISOString(),
  }))

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "title", headerName: "Property", width: 200 },
    { field: "location", headerName: "Location", width: 150 },
    {
      field: "price",
      headerName: "Price",
      width: 120,
      renderCell: (params) => `₹${params.value.toLocaleString()}`,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            params.value === "Sold" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    { field: "type", headerName: "Type", width: 120 },
    {
      field: "date",
      headerName: "Listed Date",
      width: 150,
      valueFormatter: (params) => params.value,
    },
  ]

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-rose-500 border-r-emerald-500 border-b-amber-500 border-l-violet-500 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-800">
            Loading
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 sm:p-4 bg-gray-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Real Estate Dashboard</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Overview of property listings and sales</p>
        </div>
      </div>

      {/* Stats Cards - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
            </div>
            <p className="text-lg sm:text-xl font-bold mt-2 mb-0.5">
              {stat.format ? ` ₹${stat.value.toLocaleString()}` : stat.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* First Row - Property Status and Commission Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
        {/* Property Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm sm:text-base font-semibold text-gray-800">Property Status</h2>
            <div className="flex space-x-1">
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                {soldPropertiesCount.sold} Sold
              </span>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                {soldPropertiesCount.unsold} Available
              </span>
            </div>
          </div>
          <div className="h-[160px] sm:h-[180px]">
            <BarChart
              xAxis={soldPropertiesChartData.xAxis}
              series={soldPropertiesChartData.series}
              height={160}
              margin={{ top: 10, right: 10, bottom: 20, left: 40 }}
              slotProps={{
                legend: { hidden: true },
              }}
            />
          </div>
        </div>
     
        {/* Commission Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2 sm:gap-0">
            <h2 className="text-sm sm:text-base font-semibold text-gray-800">Commission Summary</h2>
            <div className="flex items-center gap-2">
              {/* <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                {selectedYear}
              </span> */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Calendar className="h-3 sm:h-4 w-3 sm:w-4 text-gray-500 ml-1 sm:ml-2" />
                <select 
                  className="bg-transparent text-xs sm:text-sm border-none focus:ring-0"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 justify-center ">
            <div className="p-4 bg-purple-100 rounded-md">
              <p className="text-xs text-gray-500">Total Commission</p>
              <p className="text-base sm:text-lg font-bold">₹{currentYearCommissionData.totalCommission.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-orange-100 rounded-md">
              <p className="text-xs text-gray-500">Avg per Sale</p>
              <p className="text-base sm:text-lg font-bold">₹{Math.round(currentYearCommissionData.averageCommission).toLocaleString()}</p>
            </div>
            <div className="p-4 bg-green-100 rounded-md">
              <p className="text-xs text-gray-500">Transactions</p>
              <p className="text-base sm:text-lg font-bold">{currentYearCommissionData.transactions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2 sm:gap-0">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800">Sales Commission Analysis</h2>
          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
              Total: ₹{currentYearCommissionData.totalCommission.toLocaleString()}
            </span>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
              Transactions: {currentYearCommissionData.transactions}
            </span>
          </div>
        </div>
        <div >
          <LineChart
            xAxis={commissionChartData.xAxis}
            series={commissionChartData.series}
            height={250}
            margin={{ top: 10, right: 10, bottom: 20, left: 40 }}
            slotProps={{
              legend: { hidden: true },
            }}
          />
        </div>
      </div>

      {/* Commission Details Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800">Commission Details</h2>
        </div>
        <div style={{ height: 300, width: '100%' }}>
          <DataGrid
            rows={currentYearCommissionData.commissionList}
            columns={commissionColumns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-columnHeader:focus': {
                outline: 'none',
              },
            }}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1   gap-3 sm:gap-4 mb-4">
        {/* User Growth */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm sm:text-base font-semibold text-gray-800">User Growth</h2>
            <span className="text-xs px-2 py-1 bg-rose-100 text-rose-700 rounded-full">
              +{monthlyUserCount.reduce((a, b) => a + b, 0)} users
            </span>
          </div>
          <div >
            <LineChart
              xAxis={userGrowthChartData.xAxis}
              series={userGrowthChartData.series}
              height={220}
              margin={{ top: 10, right: 10, bottom: 20, left: 40 }}
              slotProps={{
                legend: { hidden: true },
              }}
            />
          </div>
        </div>

        {/* Property Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm sm:text-base font-semibold text-gray-800">Property Listings</h2>
            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
              +{monthlyPropertyCount.reduce((a, b) => a + b, 0)} properties
            </span>
          </div>
          <div >
            <LineChart
              xAxis={propertyTrendData.xAxis}
              series={propertyTrendData.series}
              height={220}
              margin={{ top: 10, right: 10, bottom: 20, left: 40 }}
              slotProps={{
                legend: { hidden: true },
              }}
            />
          </div>
        </div>

        {/* Property Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm sm:text-base font-semibold text-gray-800">Property Distribution</h2>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                className={`px-2 py-0.5 text-xs rounded-md transition-all ${
                  activeTab === "category" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("category")}
              >
                Category
              </button>
              <button
                className={`px-2 py-0.5 text-xs rounded-md transition-all ${
                  activeTab === "district" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("district")}
              >
                District
              </button>
            </div>
          </div>
          <div className="h-[160px] sm:h-[180px] flex justify-center">
            {activeTab === "category" ? (
              <PieChart
                series={dynamicCategoryData.series}
                height={160}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                colors={["#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]}
                slotProps={{
                  legend: { hidden: true },
                }}
              />
            ) : (
              <PieChart
                series={dynamicDistrictData.series}
                height={160}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                colors={["#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"]}
                slotProps={{
                  legend: { hidden: true },
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Property Listings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2 sm:gap-0">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800">Latest Properties</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search properties..."
                className="pl-8 pr-3 py-1 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            </div>
          </div>
        </div>
        <div style={{ height: 270, width: "100%" }}>
          <DataGrid
            rows={propertyListings}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
            disableRowSelectionOnClick
            sx={{
              border: "none",
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-columnHeader:focus": {
                outline: "none",
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}