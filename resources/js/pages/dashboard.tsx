import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({
    soldVsNotSoldChart,
    itemsSoldToday,
    monthlySalesChart,
    productTypeDistribution,
}: {
    soldVsNotSoldChart: object;
    itemsSoldToday: number;
    monthlySalesChart: object;
    productTypeDistribution: object;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Modified grid layout with increased height */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-5">
                    {/* First row - left: Pie chart with more space (2 columns) and increased height */}
                    <div className="md:col-span-2 border-sidebar-border/70 dark:border-sidebar-border relative rounded-xl border py-4">
                        <h2 className="text-center text-xl font-bold mb-2">All time Sold vs Not Sold</h2>
                        <div className="h-64">
                            <Pie 
                                data={soldVsNotSoldChart} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                    
                    {/* First row - middle: Counter (1 column) with increased height */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex flex-col items-center justify-start rounded-xl border py-4">
                        <h2 className="text-center text-xl font-bold">Items Sold Today</h2>
                        <div className="flex flex-col items-center justify-center h-64">
                            <p className="text-6xl font-bold">{itemsSoldToday}</p>
                            <p className="text-gray-500 text-xl mt-2">Items</p>
                        </div>
                    </div>
                    
                    {/* First row - right: Bar chart (2 columns) with increased height */}
                    <div className="md:col-span-2 border-sidebar-border/70 dark:border-sidebar-border relative rounded-xl border py-4">
                        <h2 className="text-center text-xl font-bold mb-2">Past 6 Months Sales</h2>
                        <div className="h-64">
                            <Bar 
                                data={monthlySalesChart} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }} 
                            />
                        </div>
                    </div>
                </div>
                
                {/* Second row - full width: Pie chart for product types with increased height */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-4">
                    <h2 className="text-center text-2xl font-bold mb-4">Product Type Distribution</h2>
                    <div className="h-80">
                        <Doughnut 
                            data={productTypeDistribution} 
                            className="mx-auto"
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'right',
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}