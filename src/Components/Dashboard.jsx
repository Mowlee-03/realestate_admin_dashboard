import React from 'react';
import { LineChart, BarChart, PieChart } from '@mui/x-charts';
import { Building2, Users, DollarSign } from 'lucide-react';

const Dashboard = () => {
  // Mock data for user counts per month
  const userChartData = {
    xAxis: [{ 
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      scaleType: 'band',
    }],
    series: [
      {
        data: [30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195],
        label: 'Users',
        color: '#3b82f6',
      },
    ],
  };

  // Mock data for property categories
  const categoryData = {
    series: [{
      data: [
        { value: 35, label: 'Houses' },
        { value: 25, label: 'Apartments' },
        { value: 20, label: 'Villas' },
        { value: 15, label: 'Condos' },
        { value: 5, label: 'Others' },
      ],
      highlightScope: { faded: 'global', highlighted: 'item' },
      faded: { innerRadius: 30, additionalRadius: -30 },
    }],
    height: 200,
  };

  // Mock data for property listings trend
  const propertyTrendData = {
    xAxis: [{ 
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      scaleType: 'band',
    }],
    series: [
      {
        data: [25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125, 135],
        label: 'Properties',
        color: '#10b981',
      },
    ],
  };

  const stats = [
    { title: 'Total Properties', value: '156', icon: <Building2 /> },
    { title: 'Active Users', value: '2,345', icon: <Users /> },
    // { title: 'Total Revenue', value: '$234,567', icon: <DollarSign /> },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 max-lg:text-center">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className="text-blue-500">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">User Growth</h2>
          <div className="h-[300px]">
            <LineChart
              xAxis={userChartData.xAxis}
              series={userChartData.series}
              height={300}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Property Listings Trend</h2>
          <div className="h-[300px]">
            <BarChart
              xAxis={propertyTrendData.xAxis}
              series={propertyTrendData.series}
              height={300}
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Properties by Category</h2>
        <div className="h-[300px] flex justify-center">
          <PieChart
            series={categoryData.series}
            height={300}
            width={600}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;