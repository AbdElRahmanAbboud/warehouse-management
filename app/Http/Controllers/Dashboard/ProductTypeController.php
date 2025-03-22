<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductType\IndexProductTypeRequest;
use App\Http\Requests\ProductType\StoreProductTypeRequest;
use App\Http\Requests\ProductType\UpdateProductTypeRequest;
use App\Models\ProductType;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

use function App\Helpers\store_or_update_image;

class ProductTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(IndexProductTypeRequest $request): Response
    {
        $search = $request->input('search');
        $perPage = $request->input('perPage', 10);

        $productTypes = ProductType::query()
            ->when($search, function ($query) use ($search) {
                $query->whereLike('name', "%{$search}%");
            })
            ->withCount('myAvailableItems')
            ->latest()
            ->paginate($perPage);

        $productTypes->map(function ($productType) {
            $productType->image = $productType->getFirstMediaUrl('images');

            return $productType;
        });

        return Inertia::render('product-types/index', [
            'productTypes' => $productTypes,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductTypeRequest $request): RedirectResponse
    {
        try {
            DB::beginTransaction();

            $productType = ProductType::create($request->validated());

            store_or_update_image($request, $productType);

            DB::commit();

            return back()->with('success', 'Product type stored successfully !');

        } catch (Exception) {
            DB::rollBack();

            return back()->with('error', 'Something went wrong !');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductTypeRequest $request, ProductType $productType): RedirectResponse
    {
        try {
            DB::beginTransaction();

            $productType->update($request->validated());

            store_or_update_image($request, $productType);

            DB::commit();

            return back()->with('success', 'Product type updated successfully !');

        } catch (Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Something went wrong !');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductType $productType): RedirectResponse
    {
        $productType->delete();

        return back()->with('success', 'Product type deleted successfully !');
    }
}
