"use client"

import { useEffect, useState } from "react"
import { LineChart, BarChart, PieChart } from "@mui/x-charts"
import { DataGrid } from "@mui/x-data-grid"
import { Building2, Users, DollarSign, Home, ArrowUpRight, Search, Filter, Download, RefreshCw } from "lucide-react"
import axios from "axios"
import { PROPERTIES_COUNT, PROPERTIES_IN_CATEGORY, PROPERTIES_IN_DISTRICT, USERS_DATA, VIEW_ALL_PROPERTY } from "./auth/api"

export default function Dashboard() {
  const [propertiesInCategory, setPropertiesInCategory] = useState([])
  const [propertiesInDistrict, setPropertiesInDistrict] = useState([])
  const [users, setUsers] = useState([])
  const [properties, setProperties] = useState([])
  const [soldPropertiesCount, setSoldPropertiesCount] = useState({ sold: 0, unsold: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("category")
  const [searchTerm, setSearchTerm] = useState("")
  const [listProperties,setListproperties]=useState([])
  // Mock data for property cost analysis (will be replaced with API data later)
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
      const [categoryRes, districtRes, usersRes, propertiesRes,listproperty] = await Promise.all([
        axios.get(PROPERTIES_IN_CATEGORY),
        axios.get(PROPERTIES_IN_DISTRICT),
        axios.get(USERS_DATA),
        axios.get(PROPERTIES_COUNT),
        axios.get(VIEW_ALL_PROPERTY),
      ])


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

  // Stats cards data - MODIFIED: Removed sold and available properties cards, added total sales card
  const stats = [
    {
      title: "Total Properties",
      value: properties.length,
      icon: <Building2 className="h-5 w-5" />,
      color: "bg-rose-100 text-rose-600",
      increase: "+12%",
    },
    {
      title: "Active Users",
      value: users.length,
      icon: <Users className="h-5 w-5" />,
      color: "bg-emerald-100 text-emerald-600",
      increase: "+8%",
    },
    {
      title: "Total Sales (Year)",
      value: propertyCostData.totalSales,
      icon: <DollarSign className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-600",
      increase: "+18%",
      format: true,
    },
  ]

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

  // Sold vs Unsold properties chart data - MODIFIED: Updated colors for better differentiation
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

  // Property cost analysis chart data
  const propertyCostChartData = {
    xAxis: [
      {
        data: monthNames,
        scaleType: "band",
      },
    ],
    series: [
      {
        data: propertyCostData.monthlySales,
        label: "Monthly Sales ($)",
        color: "#3b82f6",
        area: true,
        showMark: false,
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

  // Mock data for property listings table
  console.log(listProperties);
  
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
    <div className="p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Real Estate Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of property listings and sales</p>
        </div>
        <div className="flex items-center space-x-2">
         
        </div>
      </div>

      {/* Stats Cards - MODIFIED: Now 3 cards instead of 4 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
              <div className="flex items-center">
                <span className="text-green-500 text-xs mr-1">{stat.increase}</span>
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              </div>
            </div>
            <p className="text-xl font-bold mt-2 mb-0.5">
              {stat.format ? `$${stat.value.toLocaleString()}` : stat.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Property Cost Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-800">Property Sales Analysis</h2>
            <div className="flex space-x-2">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                Total: ${propertyCostData.totalSales.toLocaleString()}
              </span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                Avg: ${propertyCostData.averageSalePrice.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="h-[180px]">
            <LineChart
              xAxis={propertyCostChartData.xAxis}
              series={propertyCostChartData.series}
              height={180}
              margin={{ top: 10, right: 10, bottom: 20, left: 40 }}
              slotProps={{
                legend: { hidden: true },
              }}
            />
          </div>
        </div>

        {/* Property Status - MODIFIED: Updated with different colors and added more detail in the heading */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-800">Property Status</h2>
            <div className="flex space-x-1">
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                {soldPropertiesCount.sold} Sold
              </span>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                {soldPropertiesCount.unsold} Available
              </span>
            </div>
          </div>
          <div className="h-[180px]">
            <BarChart
              xAxis={soldPropertiesChartData.xAxis}
              series={soldPropertiesChartData.series}
              height={180}
              margin={{ top: 10, right: 10, bottom: 20, left: 40 }}
              slotProps={{
                legend: { hidden: true },
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* User Growth */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-800">User Growth</h2>
            <span className="text-xs px-2 py-1 bg-rose-100 text-rose-700 rounded-full">
              +{monthlyUserCount.reduce((a, b) => a + b, 0)} users
            </span>
          </div>
          <div className="h-[180px]">
            <LineChart
              xAxis={userGrowthChartData.xAxis}
              series={userGrowthChartData.series}
              height={180}
              margin={{ top: 10, right: 10, bottom: 20, left: 40 }}
              slotProps={{
                legend: { hidden: true },
              }}
            />
          </div>
        </div>

        {/* Property Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-800">Property Listings</h2>
            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
              +{monthlyPropertyCount.reduce((a, b) => a + b, 0)} properties
            </span>
          </div>
          <div className="h-[180px]">
            <LineChart
              xAxis={propertyTrendData.xAxis}
              series={propertyTrendData.series}
              height={180}
              margin={{ top: 10, right: 10, bottom: 20, left: 40 }}
              slotProps={{
                legend: { hidden: true },
              }}
            />
          </div>
        </div>

        {/* Property Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-800">Property Distribution</h2>
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
          <div className="h-[180px] flex justify-center">
            {activeTab === "category" ? (
              <PieChart
                
                series={dynamicCategoryData.series}
                height={dynamicCategoryData.height}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                colors={["#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]}
                slotProps={{
                  legend: { hidden: true },
                }}
              />
            ) : (
              <PieChart
              
                series={dynamicDistrictData.series}
                height={dynamicDistrictData.height}
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">Latest Properties</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search properties..."
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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