<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\ProductType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $allTimesItemsSoldCount = Item::mine()->sold()->count();
        $allTimesItemsNotSoldCount = Item::mine()->notSold()->count();

        $itemsSoldTodayCount = Item::mine()->sold()->whereToday('sold_at')->count();

        $topUsedProductTypes = ProductType::query()
            ->withCount('myItems')
            ->orderByDesc('my_items_count')
            ->limit(10)
            ->get();


        $itemsSoldByMonths = Item::mine()
            ->where('sold_at', '>=', now()->subMonths(6)->startOfMonth())
            ->selectRaw("DATE_FORMAT(sold_at, '%Y-%m') as month, COUNT(*) as total")
            ->groupByRaw("DATE_FORMAT(sold_at, '%Y-%m')")
            ->orderBy('month')
            ->get();

        return Inertia::render('dashboard', [
            'soldVsNotSoldChart' => [
                'labels' => ['Sold', 'Not Sold'],
                'datasets' => [
                    [
                        'label' => 'Items',
                        'backgroundColor' => ['#4CAF50', '#FFC107'],
                        'data' => [$allTimesItemsSoldCount, $allTimesItemsNotSoldCount],
                    ],
                ],
            ],
            'itemsSoldToday' => $itemsSoldTodayCount,
            'monthlySalesChart' => [
                'labels' => $itemsSoldByMonths->pluck('month'),
                'datasets' => [
                    [
                        'label' => 'Sales',
                        'backgroundColor' => '#2196F3',
                        'data' => $itemsSoldByMonths->pluck('total'),
                    ],
                ],
            ],
            'productTypeDistribution' => [
                'labels' => $topUsedProductTypes->pluck('name'),
                'datasets' => [
                    [
                        'label' => 'Product Types',
                        'backgroundColor' => ["#1E90FF", "#32CD32", "#FF4500", "#8A2BE2", "#FFD700", "#00CED1", "#DC143C", "#FF8C00", "#9932CC", "#2E8B57"],
                        'data' => $topUsedProductTypes->pluck('my_items_count'),
                    ],
                ],
            ],
        ]);
        
    }
}
