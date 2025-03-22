<?php

namespace Database\Seeders;

use App\Models\ProductType;
use Illuminate\Database\Seeder;

class ProductTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $productTypes = [
            'food',
            'clothing',
            'small electronics',
            'large electronics',
            'toys',
            'tools',
            'books',
            'furniture',
            'appliances',
            'sporting goods',
            'automotive parts',
            'jewelry',
            'collectibles',
            'antiques',
            'art',
        ];

        $productTypes = array_map(fn ($name) => [
            'name' => $name,
            'created_at' => now(),
            'updated_at' => now(),
        ], $productTypes);

        ProductType::insert($productTypes);
        // ProductType::factory()->count(10)->create();
    }
}
